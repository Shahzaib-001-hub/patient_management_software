import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ClinicSettings from "@/models/ClinicSettings";
import { requireAuth, requirePermission } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();
  let settings = await ClinicSettings.findOne().lean();
  if (!settings) {
    settings = await ClinicSettings.create({});
  }
  return NextResponse.json({ settings });
}

export async function PATCH(req) {
  const { error } = await requirePermission("MANAGE_CLINIC_SETTINGS");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  let settings = await ClinicSettings.findOne();
  if (!settings) {
    settings = await ClinicSettings.create(body);
  } else {
    Object.assign(settings, body);
    await settings.save();
  }
  return NextResponse.json({ settings });
}
