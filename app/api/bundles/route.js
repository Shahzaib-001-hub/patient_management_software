import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExerciseBundle from "@/models/ExerciseBundle";
import { requireAuth, requirePermission } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const bundles = await ExerciseBundle.find()
    .sort({ createdAt: -1 })
    .populate("phases.exercises.exerciseId", "name bodyArea difficulty defaultSets defaultReps")
    .lean();
  return NextResponse.json({ bundles });
}

export async function POST(req) {
  const { error, user } = await requirePermission("MANAGE_EXERCISES");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json(
      { error: "Bundle name is required" },
      { status: 400 }
    );
  }

  const bundle = await ExerciseBundle.create({
    ...body,
    createdBy: user.userId,
  });
  return NextResponse.json({ bundle }, { status: 201 });
}
