import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import { requirePermission, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_APPOINTMENTS");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;

  if (user.role === ROLES.PATIENT) {
    filter.patientId = user.patientProfileId;
  } else if (user.role === ROLES.DOCTOR) {
    filter.doctorId = user.userId;
  }

  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }

  const appointments = await Appointment.find(filter)
    .sort({ scheduledAt: 1 })
    .limit(200)
    .populate("patientId", "patientId personalInfo contact patientType")
    .populate("doctorId", "name specialization")
    .lean();

  return NextResponse.json({ appointments });
}

export async function POST(req) {
  const { error, user } = await requirePermission("VIEW_APPOINTMENTS");
  if (error) return error;

  await connectDB();
  const body = await req.json();

  let {
    patientId,
    doctorId,
    type = "in_clinic",
    scheduledAt,
    durationMinutes = 30,
    notes = "",
    timezone = "Asia/Karachi",
  } = body;

  if (user.role === ROLES.PATIENT) {
    patientId = user.patientProfileId;
  }

  if (!patientId || !doctorId || !scheduledAt) {
    return NextResponse.json(
      { error: "Patient, doctor, and date/time are required" },
      { status: 400 }
    );
  }

  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  // Double-booking prevention for the same doctor
  const conflict = await Appointment.findOne({
    doctorId,
    status: { $nin: ["cancelled", "no_show", "rescheduled"] },
    scheduledAt: {
      $lt: end,
      $gt: new Date(start.getTime() - 60 * 60000),
    },
  }).lean();

  if (conflict) {
    const conflictStart = new Date(conflict.scheduledAt);
    const conflictEnd = new Date(
      conflictStart.getTime() + (conflict.durationMinutes || 30) * 60000
    );
    if (start < conflictEnd && end > conflictStart) {
      return NextResponse.json(
        {
          error:
            "Double booking prevented: this doctor already has an appointment during the selected time slot.",
        },
        { status: 409 }
      );
    }
  }

  const meetingLink =
    type === "online_video"
      ? `https://meet.jit.si/prwc-${Date.now().toString(36)}`
      : "";

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    type,
    status: user.role === ROLES.PATIENT ? "pending" : "confirmed",
    scheduledAt: start,
    durationMinutes,
    notes,
    meetingLink,
    timezone,
    createdBy: user.userId,
  });

  const patientDoc = await Patient.findById(patientId).lean();
  if (patientDoc?.userId) {
    await Notification.create({
      userId: patientDoc.userId,
      patientId,
      type:
        appointment.status === "confirmed"
          ? "appointment_confirmed"
          : "general",
      title:
        appointment.status === "confirmed"
          ? "Appointment Confirmed"
          : "Appointment Request Received",
      message: `Your ${type.replace("_", " ")} is scheduled for ${start.toLocaleString()}.`,
    });
  }

  await logAudit({
    user,
    action: "CREATE_APPOINTMENT",
    resourceType: "Appointment",
    resourceId: appointment._id,
    patientId,
    details: `Booked ${type} for ${start.toISOString()}`,
    req,
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
