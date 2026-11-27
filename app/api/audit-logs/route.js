import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  const { error } = await requirePermission("VIEW_AUDIT_LOGS");
  if (error) return error;

  await connectDB();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(150).lean();
  return NextResponse.json({ logs });
}
