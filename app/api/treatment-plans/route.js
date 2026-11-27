import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TreatmentPlan from "@/models/TreatmentPlan";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import { requireAuth, requirePermission, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if ([ROLES.ACCOUNTANT, ROLES.RECEPTIONIST].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");

  if (user.role === ROLES.PATIENT) {
    patientId = user.patientProfileId;
  }

  const filter = patientId ? { patientId } : {};
  const plans = await TreatmentPlan.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "patientId personalInfo")
    .populate("doctorId", "name specialization")
    .lean();

  return NextResponse.json({ plans });
}

export async function POST(req) {
  const { error, user } = await requirePermission("WRITE_CLINICAL");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const {
    patientId,
    assessmentId,
    title,
    diagnosis,
    goals,
    recommendations,
    medications = [],
    startDate,
    reviewDate,
    status = "active",
    doctorNotes = "",
  } = body;

  if (!patientId || !title || !diagnosis) {
    return NextResponse.json(
      { error: "Patient, plan title, and diagnosis are required" },
      { status: 400 }
    );
  }

  const stampedMeds = medications.map((m) => ({
    ...m,
    prescribedBy: user.userId,
    prescribedByName: user.name,
    prescribedAt: new Date(),
  }));

  const plan = await TreatmentPlan.create({
    patientId,
    assessmentId: assessmentId || null,
    doctorId: user.userId,
    version: 1,
    title,
    diagnosis,
    goals,
    recommendations,
    medications: stampedMeds,
    startDate: startDate ? new Date(startDate) : new Date(),
    reviewDate: reviewDate ? new Date(reviewDate) : null,
    status,
    doctorNotes,
    history: [
      {
        version: 1,
        changedBy: user.userId,
        summary: "Initial treatment plan created",
      },
    ],
  });

  const patientDoc = await Patient.findById(patientId).lean();
  if (patientDoc?.userId) {
    await Notification.create({
      userId: patientDoc.userId,
      patientId,
      type: "treatment_updated",
      title: "New Treatment Plan Created",
      message: `Dr. ${user.name} created treatment plan: ${title}.`,
    });
  }

  await logAudit({
    user,
    action: "CREATE_TREATMENT_PLAN",
    resourceType: "TreatmentPlan",
    resourceId: plan._id,
    patientId,
    details: `Created treatment plan "${title}"`,
    req,
  });

  return NextResponse.json({ plan }, { status: 201 });
}
