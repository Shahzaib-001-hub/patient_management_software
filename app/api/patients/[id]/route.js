import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import PainAssessment from "@/models/PainAssessment";
import TreatmentPlan from "@/models/TreatmentPlan";
import RehabilitationPlan from "@/models/RehabilitationPlan";
import MedicalDocument from "@/models/MedicalDocument";
import Invoice from "@/models/Invoice";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await params;

  // Patient role can only access their own record
  if (user.role === ROLES.PATIENT) {
    if (!user.patientProfileId || user.patientProfileId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let query = Patient.findById(id).populate(
    "registration.assignedDoctor",
    "name specialization"
  );

  if (user.role === ROLES.PATIENT || user.role === ROLES.ACCOUNTANT) {
    query = query.select("-internalNotes");
  }

  const patient = await query.lean();
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const isAccountant = user.role === ROLES.ACCOUNTANT;
  const isReceptionist = user.role === ROLES.RECEPTIONIST;
  const isPatient = user.role === ROLES.PATIENT;

  const [appointments, assessments, treatmentPlans, rehabPlans, documents, invoices] =
    await Promise.all([
      Appointment.find({ patientId: id })
        .sort({ scheduledAt: -1 })
        .populate("doctorId", "name specialization")
        .lean(),
      isAccountant || isReceptionist
        ? Promise.resolve([])
        : PainAssessment.find({ patientId: id })
            .sort({ assessedAt: -1 })
            .populate("assessedBy", "name")
            .lean(),
      isAccountant || isReceptionist
        ? Promise.resolve([])
        : TreatmentPlan.find({ patientId: id })
            .sort({ createdAt: -1 })
            .populate("doctorId", "name")
            .lean(),
      isAccountant
        ? Promise.resolve([])
        : RehabilitationPlan.find({ patientId: id })
            .sort({ createdAt: -1 })
            .populate("exercises.exerciseId", "name bodyArea difficulty videoUrl instructions defaultSets defaultReps precautions")
            .populate("assignedBy", "name")
            .lean(),
      isAccountant
        ? Promise.resolve([])
        : MedicalDocument.find({
            patientId: id,
            ...(isPatient ? { sharedWithPatient: true } : {}),
          })
            .sort({ createdAt: -1 })
            .populate("uploadedBy", "name role")
            .lean(),
      Invoice.find({ patientId: id }).sort({ createdAt: -1 }).lean(),
    ]);

  await logAudit({
    user,
    action: "VIEW_PATIENT",
    resourceType: "Patient",
    resourceId: id,
    patientId: id,
    details: `Viewed patient profile ${patient.patientId}`,
    req,
  });

  return NextResponse.json({
    patient,
    appointments,
    assessments,
    treatmentPlans,
    rehabPlans,
    documents,
    invoices,
  });
}

export async function PATCH(req, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  // Patients cannot directly edit doctor-authored records; they submit correction requests
  if (user.role === ROLES.PATIENT) {
    if (user.patientProfileId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (body.correctionRequest) {
      const updated = await Patient.findByIdAndUpdate(
        id,
        { $push: { correctionRequests: body.correctionRequest } },
        { returnDocument: "after" }
      ).lean();
      return NextResponse.json({ patient: updated });
    }
    return NextResponse.json(
      { error: "Patients must submit a correction request for staff review" },
      { status: 403 }
    );
  }

  if (
    ![
      ROLES.SUPER_ADMIN,
      ROLES.CLINIC_ADMIN,
      ROLES.RECEPTIONIST,
      ROLES.DOCTOR,
    ].includes(user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = { updatedBy: user.userId };
  if (body.personalInfo) updates.personalInfo = body.personalInfo;
  if (body.contact) updates.contact = body.contact;
  if (body.emergencyContact) updates.emergencyContact = body.emergencyContact;
  if (body.patientType) updates.patientType = body.patientType;
  if (body.medicalHistory) updates.medicalHistory = body.medicalHistory;
  if (body.assignedDoctor !== undefined) {
    updates["registration.assignedDoctor"] = body.assignedDoctor || null;
  }
  if (
    body.status &&
    [ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN].includes(user.role)
  ) {
    updates.status = body.status;
  }

  let query = Patient.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
  });

  if (body.internalNote) {
    query = Patient.findByIdAndUpdate(
      id,
      {
        ...updates,
        $push: {
          internalNotes: {
            note: body.internalNote,
            createdBy: user.userId,
            createdByName: user.name,
          },
        },
      },
      { returnDocument: "after" }
    );
  }

  const patient = await query.lean();
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  await logAudit({
    user,
    action: body.status === "archived" ? "ARCHIVE_PATIENT" : "UPDATE_PATIENT",
    resourceType: "Patient",
    resourceId: id,
    patientId: id,
    details: `Updated patient ${patient.patientId}`,
    req,
  });

  return NextResponse.json({ patient });
}
