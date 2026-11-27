import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RehabilitationPlan from "@/models/RehabilitationPlan";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(req, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const plan = await RehabilitationPlan.findById(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Patient can only log exercise completion/feedback on their own plan
  if (user.role === ROLES.PATIENT) {
    if (plan.patientId.toString() !== user.patientProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!body.logEntry?.exerciseId) {
      return NextResponse.json(
        { error: "Exercise log entry required" },
        { status: 400 }
      );
    }
    plan.logs.push({
      exerciseId: body.logEntry.exerciseId,
      completedAt: new Date(),
      painAfter: Number(body.logEntry.painAfter ?? 0),
      difficulty: body.logEntry.difficulty || "moderate",
      feedback: body.logEntry.feedback || "",
      status: body.logEntry.status || "completed",
    });
    await plan.save();
    return NextResponse.json({ plan });
  }

  // Staff / Doctor can update status or revoke access
  if (
    ![
      ROLES.SUPER_ADMIN,
      ROLES.CLINIC_ADMIN,
      ROLES.DOCTOR,
      ROLES.REHAB_STAFF,
    ].includes(user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.status) plan.status = body.status;
  if (body.doctorInstructions !== undefined) {
    plan.doctorInstructions = body.doctorInstructions;
  }
  await plan.save();

  await logAudit({
    user,
    action: "UPDATE_REHABILITATION",
    resourceType: "RehabilitationPlan",
    resourceId: id,
    patientId: plan.patientId,
    details: `Rehab plan status -> ${plan.status}`,
    req,
  });

  return NextResponse.json({ plan });
}
