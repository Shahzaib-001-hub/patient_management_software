import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TreatmentPlan from "@/models/TreatmentPlan";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(req, { params }) {
  const { error, user } = await requirePermission("WRITE_CLINICAL");
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const plan = await TreatmentPlan.findById(id);
  if (!plan) {
    return NextResponse.json({ error: "Treatment plan not found" }, { status: 404 });
  }

  if (body.sessionNote) {
    plan.sessions.push({
      sessionDate: new Date(),
      notes: body.sessionNote,
      progressSummary: body.progressSummary || "",
      recordedBy: user.userId,
      recordedByName: user.name,
    });
  } else {
    if (body.title) plan.title = body.title;
    if (body.diagnosis) plan.diagnosis = body.diagnosis;
    if (body.goals !== undefined) plan.goals = body.goals;
    if (body.recommendations !== undefined) plan.recommendations = body.recommendations;
    if (body.status) plan.status = body.status;
    if (body.discontinueReason !== undefined) plan.discontinueReason = body.discontinueReason;
    if (body.doctorNotes !== undefined) plan.doctorNotes = body.doctorNotes;
    if (body.medications) {
      plan.medications = body.medications.map((m) => ({
        ...m,
        prescribedBy: m.prescribedBy || user.userId,
        prescribedByName: m.prescribedByName || user.name,
      }));
    }
    plan.version += 1;
    plan.history.push({
      version: plan.version,
      changedBy: user.userId,
      summary: body.changeSummary || `Updated to version ${plan.version}`,
    });
  }

  await plan.save();

  await logAudit({
    user,
    action: "UPDATE_TREATMENT_PLAN",
    resourceType: "TreatmentPlan",
    resourceId: id,
    patientId: plan.patientId,
    details: body.sessionNote
      ? "Added treatment session note"
      : `Updated treatment plan to v${plan.version}`,
    req,
  });

  return NextResponse.json({ plan });
}
