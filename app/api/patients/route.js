import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { requirePermission, ROLES } from "@/lib/permissions";
import { getNextSequence } from "@/lib/counters";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_PATIENTS");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "active";
  const patientType = searchParams.get("patientType") || "";

  const filter = {};
  if (status !== "all") filter.status = status;
  if (patientType) filter.patientType = patientType;
  if (user.role === ROLES.DOCTOR) {
    // Doctors see all active clinic patients or assigned patients
    // (Single-clinic pain management setup allows assigned or clinic-wide lookup)
  }

  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { patientId: regex },
      { "personalInfo.firstName": regex },
      { "personalInfo.lastName": regex },
      { "contact.phone": regex },
      { "contact.email": regex },
    ];
  }

  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("registration.assignedDoctor", "name specialization")
    .select("-internalNotes")
    .lean();

  return NextResponse.json({ patients });
}

export async function POST(req) {
  const { error, user } = await requirePermission("CREATE_PATIENT");
  if (error) return error;

  await connectDB();
  const body = await req.json();

  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    email = "",
    address = "",
    countryCode = "+92",
    timezone = "Asia/Karachi",
    emergencyName = "",
    emergencyRelationship = "",
    emergencyPhone = "",
    patientType = "physical",
    assignedDoctor = null,
    source = "Walk-in",
    previousIllnesses = [],
    surgicalHistory = [],
    allergies = [],
    currentMedications = [],
    previousInjuries = [],
    createPortalLogin = false,
    portalPassword = "",
  } = body;

  if (!firstName || !lastName || !dateOfBirth || !gender || !phone) {
    return NextResponse.json(
      { error: "First name, last name, DOB, gender, and phone are required" },
      { status: 400 }
    );
  }

  const patientId = await getNextSequence("PRWC");
  let userId = null;

  if (createPortalLogin && email && portalPassword) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "A user account with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await hashPassword(portalPassword);
    const createdUser = await User.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "patient",
      phone: phone.trim(),
    });
    userId = createdUser._id;
  }

  const patient = await Patient.create({
    patientId,
    userId,
    personalInfo: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
    },
    contact: {
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      countryCode,
      timezone,
    },
    emergencyContact: {
      name: emergencyName,
      relationship: emergencyRelationship,
      phone: emergencyPhone,
    },
    patientType,
    medicalHistory: {
      previousIllnesses,
      surgicalHistory,
      allergies,
      currentMedications,
      previousInjuries,
    },
    registration: {
      date: new Date(),
      source,
      assignedDoctor: assignedDoctor || null,
    },
    consentRecords: [{ version: "1.0", type: "Clinic Registration Consent" }],
    createdBy: user.userId,
  });

  if (userId) {
    await User.findByIdAndUpdate(userId, { patientProfileId: patient._id });
  }

  await logAudit({
    user,
    action: "CREATE_PATIENT",
    resourceType: "Patient",
    resourceId: patient._id,
    patientId: patient._id,
    details: `Registered patient ${patientId}`,
    req,
  });

  return NextResponse.json({ patient }, { status: 201 });
}
