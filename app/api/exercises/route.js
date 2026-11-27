import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import { requireAuth, requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const bodyArea = searchParams.get("bodyArea");
  const activeOnly = searchParams.get("activeOnly") === "true";

  const filter = {};
  if (bodyArea && bodyArea !== "all") filter.bodyArea = bodyArea;
  if (activeOnly) filter.isActive = true;

  const exercises = await Exercise.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ exercises });
}

export async function POST(req) {
  const { error, user } = await requirePermission("MANAGE_EXERCISES");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  if (!body.name || !body.bodyArea) {
    return NextResponse.json(
      { error: "Exercise name and body area are required" },
      { status: 400 }
    );
  }

  const exercise = await Exercise.create({
    ...body,
    createdBy: user.userId,
  });

  await logAudit({
    user,
    action: "CREATE_EXERCISE",
    resourceType: "Exercise",
    resourceId: exercise._id,
    details: `Added exercise "${exercise.name}"`,
    req,
  });

  return NextResponse.json({ exercise }, { status: 201 });
}
