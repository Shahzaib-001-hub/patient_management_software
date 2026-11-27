import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MedicalDocument from "@/models/MedicalDocument";
import { requirePermission, ROLES } from "@/lib/permissions";
import { readPrivateFile } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(req, { params }) {
  const { error, user } = await requirePermission("VIEW_DOCUMENTS");
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const doc = await MedicalDocument.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (user.role === ROLES.PATIENT) {
    if (
      doc.patientId.toString() !== user.patientProfileId ||
      !doc.sharedWithPatient
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await logAudit({
    user,
    action: "DOWNLOAD_DOCUMENT",
    resourceType: "MedicalDocument",
    resourceId: id,
    patientId: doc.patientId,
    details: `Accessed document ${doc.fileName}`,
    req,
  });

  const fileData = await readPrivateFile({
    storageProvider: doc.storageProvider,
    storageKey: doc.storageKey,
    resourceType: doc.resourceType,
  });

  if (fileData.type === "redirect") {
    return NextResponse.redirect(fileData.url);
  }

  return new NextResponse(fileData.buffer, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${doc.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
