import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const { default: User } = await import("../models/User.js");
  const { default: Patient } = await import("../models/Patient.js");
  const { default: Appointment } = await import("../models/Appointment.js");
  const { default: PainAssessment } = await import("../models/PainAssessment.js");
  const { default: TreatmentPlan } = await import("../models/TreatmentPlan.js");
  const { default: Exercise } = await import("../models/Exercise.js");
  const { default: ExerciseBundle } = await import("../models/ExerciseBundle.js");
  const { default: RehabilitationPlan } = await import("../models/RehabilitationPlan.js");
  const { default: Invoice } = await import("../models/Invoice.js");
  const { default: Payment } = await import("../models/Payment.js");
  const { default: Notification } = await import("../models/Notification.js");
  const { default: ClinicSettings } = await import("../models/ClinicSettings.js");
  const { getNextSequence } = await import("../lib/counters.js");

  const existingAdmin = await User.findOne({ email: "superadmin@prwc.pk" });
  if (existingAdmin) {
    console.log("Database already seeded. Skipping duplicate seed.");
    await mongoose.disconnect();
    return;
  }

  const hash = async (pw) => bcrypt.hash(pw, 10);

  // 1. Clinic Settings
  await ClinicSettings.create({
    clinicName: "Pain Relief & Wellness Center",
    clinicCode: "PRWC",
    phone: "+92-300-4567890",
    email: "care@prwc.pk",
    address: "42-B Gulberg III, Lahore, Pakistan",
    defaultCurrency: "PKR",
    defaultConsultationDuration: 30,
  });

  // 2. Staff Users
  const superAdmin = await User.create({
    name: "Shahzaib Ali",
    email: "superadmin@prwc.pk",
    passwordHash: await hash("Admin@1234"),
    role: "super_admin",
    phone: "+92-300-1111111",
  });

  await User.create({
    name: "Ayesha Siddiqui",
    email: "admin@prwc.pk",
    passwordHash: await hash("Admin@1234"),
    role: "clinic_admin",
    phone: "+92-300-2222222",
  });

  const doctor = await User.create({
    name: "Dr Ahmed",
    email: "doctor@prwc.pk",
    passwordHash: await hash("Doctor@1234"),
    role: "doctor",
    specialization: "Interventional Pain Management & Spine Specialist",
    phone: "+92-300-3333333",
  });

  await User.create({
    name: "Sanaullah Khan",
    email: "reception@prwc.pk",
    passwordHash: await hash("Staff@1234"),
    role: "receptionist",
    phone: "+92-300-4444444",
  });

  const rehabStaff = await User.create({
    name: "Zainab Malik (PT)",
    email: "rehab@prwc.pk",
    passwordHash: await hash("Staff@1234"),
    role: "rehab_staff",
    specialization: "Musculoskeletal Physiotherapist",
    phone: "+92-300-5555555",
  });

  await User.create({
    name: "Bilal Ahmed",
    email: "accountant@prwc.pk",
    passwordHash: await hash("Staff@1234"),
    role: "accountant",
    phone: "+92-300-6666666",
  });

  // 3. Patient Users & Profiles
  const pUser1 = await User.create({
    name: "Usman Farooq",
    email: "patient1@prwc.pk",
    passwordHash: await hash("Patient@1234"),
    role: "patient",
    phone: "+92-321-7777777",
  });

  const pUser2 = await User.create({
    name: "Fatima Noor",
    email: "patient2@prwc.pk",
    passwordHash: await hash("Patient@1234"),
    role: "patient",
    phone: "+44-7700-900123",
  });

  const pid1 = await getNextSequence("PRWC");
  const patient1 = await Patient.create({
    patientId: pid1,
    userId: pUser1._id,
    personalInfo: {
      firstName: "Usman",
      lastName: "Farooq",
      dateOfBirth: new Date("1988-04-12"),
      gender: "Male",
    },
    contact: {
      phone: "+92-321-7777777",
      email: "patient1@prwc.pk",
      address: "House 14, Block K, DHA Phase 5, Lahore",
      countryCode: "+92",
      timezone: "Asia/Karachi",
    },
    emergencyContact: {
      name: "Hina Usman",
      relationship: "Spouse",
      phone: "+92-321-7777778",
    },
    patientType: "physical",
    medicalHistory: {
      previousIllnesses: ["Hypertension (Controlled)"],
      surgicalHistory: ["Right Knee Arthroscopy (2022)"],
      allergies: ["Penicillin"],
      currentMedications: [
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
      ],
      previousInjuries: [{ injuryType: "Lumbar disc strain", date: "2024-09" }],
    },
    registration: {
      date: new Date(Date.now() - 25 * 86400000),
      source: "Walk-in",
      assignedDoctor: doctor._id,
    },
    consentRecords: [{ version: "1.0", type: "General & Clinical Care" }],
    status: "active",
    createdBy: superAdmin._id,
  });

  pUser1.patientProfileId = patient1._id;
  await pUser1.save();

  const pid2 = await getNextSequence("PRWC");
  const patient2 = await Patient.create({
    patientId: pid2,
    userId: pUser2._id,
    personalInfo: {
      firstName: "Fatima",
      lastName: "Noor",
      dateOfBirth: new Date("1993-09-23"),
      gender: "Female",
    },
    contact: {
      phone: "+44-7700-900123",
      email: "patient2@prwc.pk",
      address: "22 Baker Street, London, UK (Overseas Telehealth)",
      countryCode: "+44",
      timezone: "Europe/London",
    },
    emergencyContact: {
      name: "Noor Ahmed",
      relationship: "Father",
      phone: "+92-300-8888888",
    },
    patientType: "online",
    medicalHistory: {
      previousIllnesses: ["Cervical Spondylosis"],
      surgicalHistory: [],
      allergies: ["None known"],
      currentMedications: [],
      previousInjuries: [{ injuryType: "Whiplash injury", date: "2025-01" }],
    },
    registration: {
      date: new Date(Date.now() - 10 * 86400000),
      source: "Online Portal",
      assignedDoctor: doctor._id,
    },
    consentRecords: [{ version: "1.0", type: "Telehealth & Privacy Consent" }],
    status: "active",
    createdBy: superAdmin._id,
  });

  pUser2.patientProfileId = patient2._id;
  await pUser2.save();

  // 4. Appointments
  const now = new Date();
  const today10am = new Date(now);
  today10am.setHours(10, 0, 0, 0);
  const today2pm = new Date(now);
  today2pm.setHours(14, 0, 0, 0);
  const tomorrow11am = new Date(now.getTime() + 86400000);
  tomorrow11am.setHours(11, 0, 0, 0);

  const appt1 = await Appointment.create({
    patientId: patient1._id,
    doctorId: doctor._id,
    type: "follow_up",
    status: "confirmed",
    scheduledAt: today10am,
    durationMinutes: 30,
    notes: "Follow-up for lumbar radiculopathy & rehab review",
    createdBy: superAdmin._id,
  });

  await Appointment.create({
    patientId: patient2._id,
    doctorId: doctor._id,
    type: "online_video",
    status: "confirmed",
    scheduledAt: today2pm,
    durationMinutes: 45,
    notes: "Overseas video consultation - cervical pain evaluation",
    meetingLink: "https://meet.jit.si/prwc-consult-fatima-noor",
    timezone: "Europe/London",
    createdBy: superAdmin._id,
  });

  await Appointment.create({
    patientId: patient1._id,
    doctorId: doctor._id,
    type: "rehab_session",
    status: "pending",
    scheduledAt: tomorrow11am,
    durationMinutes: 45,
    notes: "Supervised core stabilization session",
    createdBy: rehabStaff._id,
  });

  // 5. Pain Assessments (2 historical + 1 recent for Patient 1)
  await PainAssessment.create({
    patientId: patient1._id,
    assessedBy: doctor._id,
    painInfo: {
      primaryComplaint: "Lower back pain radiating to left leg",
      location: "Lumbar L4-L5, Left gluteal region",
      onset: "Gradual over 3 months",
      duration: "3 months",
      frequency: "Constant with morning stiffness",
      characteristics: ["Aching", "Shooting"],
      aggravatingFactors: ["Prolonged sitting", "Bending forward"],
      relievingFactors: ["Lying flat", "Heat pack"],
      previousTreatment: "Oral NSAIDs for 2 weeks",
    },
    painScores: {
      current: 8,
      average24h: 7,
      worst: 9,
      atRest: 5,
      duringActivity: 9,
    },
    painLocations: [
      {
        bodyRegion: "lower_back",
        view: "back",
        side: "left",
        painType: "aching",
        severity: 8,
      },
      {
        bodyRegion: "left_thigh_back",
        view: "back",
        side: "left",
        painType: "shooting",
        severity: 7,
      },
    ],
    functionalAssessment: {
      walkingAbility: "Limited to 10 minutes",
      sittingTolerance: "15 minutes",
      standingTolerance: "20 minutes",
      sleepQuality: "Disrupted 2-3 times per night",
      dailyActivityLimitations: "Difficulty putting on socks and driving",
      rangeOfMotion: "Lumbar flexion limited to 40 degrees",
      workLifestyleImpact: "Unable to work full desk shifts",
    },
    clinicalAssessment: {
      examinationNotes: "SLR positive at 45 degrees on left side.",
      findings: "Lumbar paraspinal tenderness L4-L5",
      provisionalDiagnosis: "Lumbar Disc Herniation L4-L5 with Left Sciatica",
      confirmedDiagnosis: "Lumbar Radiculopathy (L4-L5)",
      differentialDiagnoses: ["Piriformis Syndrome", "Facet Arthropathy"],
      recommendedInvestigations: ["MRI Lumbosacral Spine"],
    },
    assessedAt: new Date(Date.now() - 21 * 86400000),
  });

  const latestAssessment = await PainAssessment.create({
    patientId: patient1._id,
    appointmentId: appt1._id,
    assessedBy: doctor._id,
    painInfo: {
      primaryComplaint: "Improving lower back discomfort",
      location: "Lumbar L4-L5",
      onset: "3 months ago",
      duration: "Improving",
      frequency: "Intermittent",
      characteristics: ["Mild aching"],
      aggravatingFactors: ["Sitting > 45 mins"],
      relievingFactors: ["Core exercises", "Walking"],
      previousTreatment: "Physiotherapy + targeted meds",
    },
    painScores: {
      current: 4,
      average24h: 4,
      worst: 6,
      atRest: 2,
      duringActivity: 5,
    },
    painLocations: [
      {
        bodyRegion: "lower_back",
        view: "back",
        side: "left",
        painType: "aching",
        severity: 4,
      },
    ],
    functionalAssessment: {
      walkingAbility: "30+ minutes comfortably",
      sittingTolerance: "45 minutes",
      standingTolerance: "45 minutes",
      sleepQuality: "Sleeping through the night",
      dailyActivityLimitations: "Minimal",
      rangeOfMotion: "Lumbar flexion improved to 70 degrees",
      workLifestyleImpact: "Returned to hybrid desk work",
    },
    clinicalAssessment: {
      examinationNotes: "SLR negative up to 75 degrees.",
      findings: "Significant reduction in paraspinal spasm",
      provisionalDiagnosis: "Resolving Lumbar Radiculopathy",
      confirmedDiagnosis: "Lumbar Radiculopathy (L4-L5) - Improving",
      differentialDiagnoses: [],
      recommendedInvestigations: [],
    },
    assessedAt: new Date(Date.now() - 2 * 86400000),
  });

  // 6. Treatment Plan
  await TreatmentPlan.create({
    patientId: patient1._id,
    assessmentId: latestAssessment._id,
    doctorId: doctor._id,
    version: 2,
    title: "Lumbar Decompression & Core Stabilization Plan",
    diagnosis: "Lumbar Radiculopathy (L4-L5)",
    goals:
      "Reduce resting pain below 2/10, restore full lumbar flexion, and return to pain-free 60-minute sitting tolerance.",
    recommendations:
      "Continue structured core stabilization 5x/week, ergonomic lumbar support at desk, avoid heavy lifting >10kg.",
    medications: [
      {
        name: "Pregabalin",
        dosage: "75mg",
        frequency: "At bedtime",
        duration: "14 days",
        instructions: "Take after dinner; may cause mild drowsiness",
        prescribedBy: doctor._id,
        prescribedByName: doctor.name,
      },
    ],
    startDate: new Date(Date.now() - 21 * 86400000),
    reviewDate: new Date(Date.now() + 14 * 86400000),
    status: "active",
    doctorNotes: "Patient responding well to conservative rehab + neuropathic support.",
    sessions: [
      {
        sessionDate: new Date(Date.now() - 7 * 86400000),
        notes: "Manual lumbar mobilization + McKenzie extension progression",
        progressSummary: "Pain dropped from 7/10 to 5/10",
        recordedBy: doctor._id,
        recordedByName: doctor.name,
      },
    ],
    history: [
      {
        version: 1,
        changedAt: new Date(Date.now() - 21 * 86400000),
        changedBy: doctor._id,
        summary: "Initial plan created",
      },
      {
        version: 2,
        changedAt: new Date(Date.now() - 2 * 86400000),
        changedBy: doctor._id,
        summary: "Updated medications and progressed to Phase 2 core rehab",
      },
    ],
  });

  // 7. Exercises & Bundles
  const ex1 = await Exercise.create({
    name: "McKenzie Prone Press-Up",
    description: "Gentle lumbar extension to centralize disc-related lower back pain.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bodyArea: "back",
    injuryCategory: "Lumbar Disc / Sciatica",
    difficulty: "beginner",
    instructions:
      "Lie face down with hands under shoulders. Slowly press upper body up while keeping hips relaxed on the mat. Hold 2 seconds, lower slowly.",
    defaultSets: 3,
    defaultReps: "10",
    durationMinutes: 8,
    frequency: "Twice daily",
    precautions: "Stop immediately if leg pain increases or radiates further down.",
    equipmentRequired: "Exercise mat",
    createdBy: rehabStaff._id,
  });

  const ex2 = await Exercise.create({
    name: "Bird-Dog Core Stabilization",
    description: "Builds deep lumbar multifidus and core stability without spinal loading.",
    bodyArea: "back",
    injuryCategory: "Lumbar Stability",
    difficulty: "intermediate",
    instructions:
      "Start on hands and knees with neutral spine. Extend opposite arm and leg simultaneously, hold 3 seconds without arching lower back.",
    defaultSets: 3,
    defaultReps: "12 each side",
    durationMinutes: 10,
    frequency: "Daily",
    precautions: "Keep pelvis level; avoid lumbar hyperextension.",
    equipmentRequired: "Exercise mat",
    createdBy: rehabStaff._id,
  });

  const ex3 = await Exercise.create({
    name: "Chin Tuck Cervical Retraction",
    description: "Relieves cervical strain and improves deep neck flexor endurance.",
    bodyArea: "neck",
    injuryCategory: "Cervical Spondylosis",
    difficulty: "beginner",
    instructions:
      "Sit upright looking straight ahead. Gently glide chin straight back as if making a double chin. Hold 5 seconds.",
    defaultSets: 3,
    defaultReps: "10",
    durationMinutes: 5,
    frequency: "3 times daily",
    precautions: "Do not tilt head up or down.",
    equipmentRequired: "None",
    createdBy: rehabStaff._id,
  });

  const ex4 = await Exercise.create({
    name: "Quad Set & Straight Leg Raise",
    description: "Early-phase quadriceps activation for ACL and knee pain recovery.",
    bodyArea: "knee",
    injuryCategory: "ACL / Meniscus",
    difficulty: "beginner",
    instructions:
      "Lie supine, tighten thigh muscle pressing knee flat, then lift straight leg 12 inches. Hold 3 seconds.",
    defaultSets: 3,
    defaultReps: "15",
    durationMinutes: 10,
    frequency: "Daily",
    precautions: "Keep knee fully locked during lift.",
    equipmentRequired: "None",
    createdBy: rehabStaff._id,
  });

  const bundle1 = await ExerciseBundle.create({
    name: "Lumbar Pain & Sciatica Recovery Program",
    description: "Structured 2-phase conservative lumbar rehabilitation bundle.",
    bodyArea: "back",
    phases: [
      {
        phaseName: "Phase 1: Initial Pain Relief & Centralization",
        exercises: [{ exerciseId: ex1._id, sets: 3, reps: "10", notes: "Gentle range" }],
      },
      {
        phaseName: "Phase 2: Core Stabilization",
        exercises: [{ exerciseId: ex2._id, sets: 3, reps: "12 each side", notes: "Slow control" }],
      },
    ],
    createdBy: rehabStaff._id,
  });

  // 8. Rehabilitation Plan Assignment for Patient 1
  await RehabilitationPlan.create({
    patientId: patient1._id,
    assignedBy: doctor._id,
    bundleId: bundle1._id,
    title: "Lumbar Recovery Program - Usman Farooq",
    startDate: new Date(Date.now() - 14 * 86400000),
    endDate: new Date(Date.now() + 30 * 86400000),
    frequency: "Daily",
    doctorInstructions: "Perform gently in the morning after a 5-minute walk.",
    reviewDate: new Date(Date.now() + 14 * 86400000),
    status: "active",
    exercises: [
      {
        exerciseId: ex1._id,
        phaseName: "Phase 1: Initial Pain Relief",
        sets: 3,
        reps: "10",
        notes: "Stop if leg tingling occurs",
      },
      {
        exerciseId: ex2._id,
        phaseName: "Phase 2: Core Stabilization",
        sets: 3,
        reps: "12 each side",
        notes: "Focus on breathing",
      },
    ],
    logs: [
      {
        exerciseId: ex1._id,
        completedAt: new Date(Date.now() - 3 * 86400000),
        painAfter: 4,
        difficulty: "moderate",
        feedback: "Felt much looser afterward",
        status: "completed",
      },
      {
        exerciseId: ex2._id,
        completedAt: new Date(Date.now() - 1 * 86400000),
        painAfter: 3,
        difficulty: "easy",
        feedback: "No radiating pain today",
        status: "completed",
      },
    ],
  });

  // 9. Invoices & Payments
  const invNum1 = await getNextSequence("INV");
  const invoice1 = await Invoice.create({
    invoiceNumber: invNum1,
    patientId: patient1._id,
    appointmentId: appt1._id,
    category: "initial_consultation",
    items: [
      { description: "Pain Management Initial Consultation", quantity: 1, unitPrice: 5000, total: 5000 },
      { description: "2-Week Supervised Rehab Package", quantity: 1, unitPrice: 12000, total: 12000 },
    ],
    subtotal: 17000,
    discount: 1000,
    discountAuthorizedBy: superAdmin._id,
    totalAmount: 16000,
    paidAmount: 10000,
    balanceDue: 6000,
    currency: "PKR",
    status: "partial",
    dueDate: new Date(Date.now() + 7 * 86400000),
    createdBy: superAdmin._id,
  });

  const rcpNum1 = await getNextSequence("RCP");
  await Payment.create({
    receiptNumber: rcpNum1,
    invoiceId: invoice1._id,
    patientId: patient1._id,
    amount: 10000,
    currency: "PKR",
    method: "bank_transfer",
    type: "payment",
    reference: "HBL-TXN-994821",
    notes: "Initial deposit",
    recordedBy: superAdmin._id,
  });

  // 10. Notifications
  await Notification.create({
    userId: pUser1._id,
    patientId: patient1._id,
    type: "appointment_confirmed",
    title: "Follow-up Appointment Confirmed",
    message: "Your follow-up consultation with Dr Ahmed is confirmed for today at 10:00 AM.",
    channel: "in_app",
  });

  await Notification.create({
    userId: pUser1._id,
    patientId: patient1._id,
    type: "exercise_assigned",
    title: "New Rehabilitation Program Assigned",
    message: "Dr Ahmed assigned the Lumbar Recovery Program to your portal.",
    channel: "in_app",
  });

  console.log("Seed completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
