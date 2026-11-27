import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import PainAssessment from "@/models/PainAssessment";
import RehabilitationPlan from "@/models/RehabilitationPlan";
import { requireAuth, ROLES } from "@/lib/permissions";

export async function GET(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (
    ![
      ROLES.SUPER_ADMIN,
      ROLES.CLINIC_ADMIN,
      ROLES.DOCTOR,
      ROLES.ACCOUNTANT,
    ].includes(user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }
  const hasDate = Object.keys(dateFilter).length > 0;

  const [
    appointmentStats,
    patientTypes,
    revenueStats,
    outstandingInvoices,
    painTrends,
    rehabPlans,
  ] = await Promise.all([
    Appointment.aggregate([
      ...(hasDate ? [{ $match: { scheduledAt: dateFilter } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Patient.aggregate([
      ...(hasDate ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: "$patientType", count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "payment",
          ...(hasDate ? { paidAt: dateFilter } : {}),
        },
      },
      {
        $group: {
          _id: "$method",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Invoice.find({ status: { $in: ["unpaid", "partial"] } })
      .populate("patientId", "patientId personalInfo contact")
      .lean(),
    user.role === ROLES.ACCOUNTANT
      ? Promise.resolve([])
      : PainAssessment.find(hasDate ? { assessedAt: dateFilter } : {})
          .sort({ assessedAt: 1 })
          .limit(50)
          .populate("patientId", "patientId personalInfo")
          .lean(),
    user.role === ROLES.ACCOUNTANT
      ? Promise.resolve([])
      : RehabilitationPlan.find({ status: "active" })
          .populate("patientId", "patientId personalInfo")
          .lean(),
  ]);

  const rehabCompletionSummary = rehabPlans.map((p) => ({
    planTitle: p.title,
    patientName: p.patientId
      ? `${p.patientId.personalInfo.firstName} ${p.patientId.personalInfo.lastName}`
      : "Patient",
    patientCode: p.patientId?.patientId || "",
    totalExercises: p.exercises?.length || 0,
    completedLogs: p.logs?.filter((l) => l.status === "completed").length || 0,
  }));

  return NextResponse.json({
    appointmentStats,
    patientTypes,
    revenueStats,
    outstandingInvoices,
    painTrends,
    rehabCompletionSummary,
  });
}
