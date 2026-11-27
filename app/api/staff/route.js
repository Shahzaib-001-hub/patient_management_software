import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth, requirePermission, ROLES } from "@/lib/permissions";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get("role");

  if (roleFilter === "doctor") {
    const doctors = await User.find({ role: "doctor", isActive: true })
      .select("name specialization email phone")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ staff: doctors });
  }

  if (![ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await User.find({ role: { $ne: "patient" } })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ staff });
}

export async function POST(req) {
  const { error, user } = await requirePermission("MANAGE_STAFF");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const { name, email, password, role, phone = "", specialization = "" } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: "Name, email, password, and role are required" },
      { status: 400 }
    );
  }

  if (role === "super_admin" && user.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "Only Super Admin can create another Super Admin" },
      { status: 403 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const staffMember = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    phone: phone.trim(),
    specialization: specialization.trim(),
    isActive: true,
  });

  await logAudit({
    user,
    action: "CREATE_STAFF",
    resourceType: "User",
    resourceId: staffMember._id,
    details: `Created staff account ${staffMember.email} (${role})`,
    req,
  });

  return NextResponse.json(
    {
      staff: {
        _id: staffMember._id,
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role,
        phone: staffMember.phone,
        specialization: staffMember.specialization,
        isActive: staffMember.isActive,
      },
    },
    { status: 201 }
  );
}
