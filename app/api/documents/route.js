import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MedicalDocument from "@/models/MedicalDocument";
import { requirePermission, ROLES } from "@/lib/permissions";
import { uploadPrivateFile } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_DOCUMENTS");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");

  const filter = {};
  if (user.role === ROLES.PATIENT) {
    filter.patientId = user.patientProfileId;
    filter.sharedWithPatient = true;
  } else if (patientId) {
    filter.patientId = patientId;
  }

  const documents = await MedicalDocument.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "patientId personalInfo")
    .populate("uploadedBy", "name role")
    .lean();

  return NextResponse.json({ documents });
}

export async function POST(req) {
  const { error, user } = await requirePermission("UPLOAD_DOCUMENTS");
  if (error) return error;

  await connectDB();
  const formData = await req.formData();
  const file = formData.get("file");
  let patientId = formData.get("patientId");
  const title = formData.get("title") || file?.name || "Medical Document";
  const category = formData.get("category") || "other";
  const description = formData.get("description") || "";
  const documentDate = formData.get("documentDate") || new Date().toISOString();
  const consultationId = formData.get("consultationId") || null;

  if (user.role === ROLES.PATIENT) {
    patientId = user.patientProfileId;
  }

  if (!file || !patientId) {
    return NextResponse.json(
      { error: "File and patient are required" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const stored = await uploadPrivateFile({
    buffer,
    originalName: file.name,
    mimeType: file.type,
    folder: "medical_records",
  });

  const doc = await MedicalDocument.create({
    patientId,
    consultationId: consultationId || null,
    title,
    category,
    documentDate: new Date(documentDate),
    description,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    bytes: stored.bytes,
    storageProvider: stored.storageProvider,
    storageKey: stored.storageKey,
    resourceType: stored.resourceType,
    sharedWithPatient: true,
    uploadedBy: user.userId,
  });

  await logAudit({
    user,
    action: "UPLOAD_DOCUMENT",
    resourceType: "MedicalDocument",
    resourceId: doc._id,
    patientId,
    details: `Uploaded ${category}: ${file.name}`,
    req,
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}
