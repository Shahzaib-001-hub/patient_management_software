import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(req, { params }) {
  const { error } = await requirePermission("MANAGE_EXERCISES");
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const exercise = await Exercise.findByIdAndUpdate(id, body, {
    returnDocument: "after",
  }).lean();

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }
  return NextResponse.json({ exercise });
}
