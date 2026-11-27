import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PainAssessment from "@/models/PainAssessment";
import { requireAuth, requirePermission, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if ([ROLES.ACCOUNTANT, ROLES.RECEPTIONIST].includes(user.role)) {
    return NextResponse.json(
      { error: "Forbidden: clinical assessments are restricted" },
      { status: 403 }
    );
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");

  if (user.role === ROLES.PATIENT) {
    patientId = user.patientProfileId;
  }

  const filter = patientId ? { patientId } : {};
  const assessments = await PainAssessment.find(filter)
    .sort({ assessedAt: -1 })
    .limit(50)
    .populate("patientId", "patientId personalInfo")
    .populate("assessedBy", "name specialization")
    .lean();

  return NextResponse.json({ assessments });
}

export async function POST(req) {
  const { error, user } = await requirePermission("WRITE_CLINICAL");
  if (error) return error;

  await connectDB();
  const body = await req.json();

  if (!body.patientId || !body.painInfo?.primaryComplaint) {
    return NextResponse.json(
      { error: "Patient and primary pain complaint are required" },
      { status: 400 }
    );
  }

  const assessment = await PainAssessment.create({
    patientId: body.patientId,
    appointmentId: body.appointmentId || null,
    assessedBy: user.userId,
    painInfo: body.painInfo,
    painScores: body.painScores,
    painLocations: body.painLocations || [],
    functionalAssessment: body.functionalAssessment || {},
    clinicalAssessment: body.clinicalAssessment || {},
    assessedAt: new Date(),
  });

  await logAudit({
    user,
    action: "CREATE_PAIN_ASSESSMENT",
    resourceType: "PainAssessment",
    resourceId: assessment._id,
    patientId: body.patientId,
    details: `Recorded pain assessment (current: ${body.painScores?.current ?? 0}/10)`,
    req,
  });

  return NextResponse.json({ assessment }, { status: 201 });
}
