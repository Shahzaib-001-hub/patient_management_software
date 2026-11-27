import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RehabilitationPlan from "@/models/RehabilitationPlan";
import ExerciseBundle from "@/models/ExerciseBundle";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import { requirePermission, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_REHAB");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");

  if (user.role === ROLES.PATIENT) {
    patientId = user.patientProfileId;
  }

  const filter = patientId ? { patientId } : {};
  const plans = await RehabilitationPlan.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "patientId personalInfo")
    .populate("assignedBy", "name")
    .populate("exercises.exerciseId")
    .lean();

  return NextResponse.json({ plans });
}

export async function POST(req) {
  const { error, user } = await requirePermission("ASSIGN_REHAB");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const {
    patientId,
    bundleId = null,
    title,
    startDate,
    endDate,
    frequency = "Daily",
    doctorInstructions = "",
    reviewDate,
    exercises = [],
  } = body;

  if (!patientId || !title) {
    return NextResponse.json(
      { error: "Patient and program title are required" },
      { status: 400 }
    );
  }

  let finalExercises = exercises;
  if (bundleId && (!exercises || exercises.length === 0)) {
    const bundle = await ExerciseBundle.findById(bundleId).lean();
    if (bundle) {
      finalExercises = bundle.phases.flatMap((phase) =>
        phase.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          phaseName: phase.phaseName,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
        }))
      );
    }
  }

  const plan = await RehabilitationPlan.create({
    patientId,
    assignedBy: user.userId,
    bundleId: bundleId || null,
    title,
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
    frequency,
    doctorInstructions,
    reviewDate: reviewDate ? new Date(reviewDate) : null,
    exercises: finalExercises,
    status: "active",
  });

  const patientDoc = await Patient.findById(patientId).lean();
  if (patientDoc?.userId) {
    await Notification.create({
      userId: patientDoc.userId,
      patientId,
      type: "exercise_assigned",
      title: "New Rehabilitation Exercises Assigned",
      message: `${title} has been assigned to your exercise portal.`,
    });
  }

  await logAudit({
    user,
    action: "ASSIGN_REHABILITATION",
    resourceType: "RehabilitationPlan",
    resourceId: plan._id,
    patientId,
    details: `Assigned "${title}" (${finalExercises.length} exercises)`,
    req,
  });

  return NextResponse.json({ plan }, { status: 201 });
}
