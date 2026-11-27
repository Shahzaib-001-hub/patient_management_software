import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requirePermission, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(req, { params }) {
  const { error, user } = await requirePermission("MANAGE_STAFF");
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  if (target.role === "super_admin" && user.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "Only Super Admin can modify Super Admin accounts" },
      { status: 403 }
    );
  }

  if (body.name !== undefined) target.name = body.name;
  if (body.phone !== undefined) target.phone = body.phone;
  if (body.specialization !== undefined) target.specialization = body.specialization;
  if (body.isActive !== undefined) target.isActive = Boolean(body.isActive);
  if (body.role !== undefined && user.role === ROLES.SUPER_ADMIN) {
    target.role = body.role;
  }

  await target.save();

  await logAudit({
    user,
    action: "UPDATE_STAFF",
    resourceType: "User",
    resourceId: id,
    details: `Updated staff ${target.email} (active: ${target.isActive})`,
    req,
  });

  return NextResponse.json({ staff: target });
}
