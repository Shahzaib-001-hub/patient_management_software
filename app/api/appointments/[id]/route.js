import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(req, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const existing = await Appointment.findById(id);
  if (!existing) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  if (
    user.role === ROLES.PATIENT &&
    existing.patientId.toString() !== user.patientProfileId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.status) existing.status = body.status;
  if (body.scheduledAt) existing.scheduledAt = new Date(body.scheduledAt);
  if (body.durationMinutes) existing.durationMinutes = body.durationMinutes;
  if (body.notes !== undefined) existing.notes = body.notes;
  if (body.cancellationReason !== undefined) {
    existing.cancellationReason = body.cancellationReason;
  }
  if (
    body.consultationNotes !== undefined &&
    [ROLES.DOCTOR, ROLES.SUPER_ADMIN].includes(user.role)
  ) {
    existing.consultationNotes = body.consultationNotes;
  }
  existing.updatedBy = user.userId;

  await existing.save();

  const patientDoc = await Patient.findById(existing.patientId).lean();
  if (patientDoc?.userId && body.status) {
    const typeMap = {
      confirmed: "appointment_confirmed",
      cancelled: "appointment_cancelled",
    };
    await Notification.create({
      userId: patientDoc.userId,
      patientId: existing.patientId,
      type: typeMap[body.status] || "general",
      title: `Appointment ${body.status.replace("_", " ")}`,
      message:
        body.status === "cancelled" && body.cancellationReason
          ? `Reason: ${body.cancellationReason}`
          : `Your appointment status is now ${body.status.replace("_", " ")}.`,
    });
  }

  await logAudit({
    user,
    action: "UPDATE_APPOINTMENT",
    resourceType: "Appointment",
    resourceId: id,
    patientId: existing.patientId,
    details: `Status -> ${existing.status}`,
    req,
  });

  return NextResponse.json({ appointment: existing });
}
