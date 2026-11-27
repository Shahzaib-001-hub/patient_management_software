import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  const { error, user: sessionUser } = await requireAuth();
  if (error) return error;

  await connectDB();
  const user = await User.findById(sessionUser.userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      specialization: user.specialization,
      patientProfileId: user.patientProfileId,
      notificationPreferences: user.notificationPreferences,
    },
  });
}

export async function PATCH(req) {
  const { error, user: sessionUser } = await requireAuth();
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const updates = {};
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.notificationPreferences) {
    updates.notificationPreferences = body.notificationPreferences;
  }

  const updated = await User.findByIdAndUpdate(sessionUser.userId, updates, {
    returnDocument: "after",
  }).lean();

  return NextResponse.json({ user: updated });
}
