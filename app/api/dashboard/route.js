import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import RehabilitationPlan from "@/models/RehabilitationPlan";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import TreatmentPlan from "@/models/TreatmentPlan";
import { requireAuth, ROLES } from "@/lib/permissions";

export async function GET(req) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (user.role === ROLES.PATIENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);

  const rangeFilter = {};
  if (fromParam || toParam) {
    rangeFilter.createdAt = {};
    if (fromParam) rangeFilter.createdAt.$gte = new Date(fromParam);
    if (toParam) {
      const end = new Date(toParam);
      end.setHours(23, 59, 59, 999);
      rangeFilter.createdAt.$lte = end;
    }
  }

  const apptScope =
    user.role === ROLES.DOCTOR ? { doctorId: user.userId } : {};

  const [
    totalPatients,
    newPatientsThisMonth,
    activePatients,
    todaysAppointments,
    pendingAppointments,
    completedConsultations,
    upcomingFollowUps,
    activeRehabPrograms,
    activeTreatmentPlans,
    pendingInvoices,
    monthlyPayments,
    recentAppointments,
    patientTypeBreakdown,
  ] = await Promise.all([
    Patient.countDocuments(rangeFilter),
    Patient.countDocuments({
      "registration.date": { $gte: startOfMonth },
    }),
    Patient.countDocuments({ status: "active" }),
    Appointment.countDocuments({
      ...apptScope,
      scheduledAt: { $gte: startOfToday, $lt: endOfToday },
      status: { $nin: ["cancelled"] },
    }),
    Appointment.countDocuments({ ...apptScope, status: "pending" }),
    Appointment.countDocuments({
      ...apptScope,
      status: "completed",
      ...(fromParam || toParam ? rangeFilter : {}),
    }),
    Appointment.countDocuments({
      ...apptScope,
      type: "follow_up",
      scheduledAt: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    }),
    RehabilitationPlan.countDocuments({ status: "active" }),
    TreatmentPlan.countDocuments({ status: "active" }),
    Invoice.aggregate([
      { $match: { status: { $in: ["unpaid", "partial"] } } },
      { $group: { _id: null, total: { $sum: "$balanceDue" }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "payment",
          paidAt: fromParam || toParam ? rangeFilter.createdAt || { $gte: startOfMonth } : { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Appointment.find({
      ...apptScope,
      scheduledAt: { $gte: startOfToday },
    })
      .sort({ scheduledAt: 1 })
      .limit(8)
      .populate("patientId", "patientId personalInfo patientType contact")
      .populate("doctorId", "name specialization")
      .lean(),
    Patient.aggregate([
      { $group: { _id: "$patientType", count: { $sum: 1 } } },
    ]),
  ]);

  const isAccountant = user.role === ROLES.ACCOUNTANT;

  return NextResponse.json({
    kpis: {
      totalPatients,
      newPatientsThisMonth,
      activePatients,
      todaysAppointments,
      pendingAppointments,
      completedConsultations,
      upcomingFollowUps,
      activeRehabPrograms,
      activeTreatmentPlans,
      pendingPaymentsAmount: pendingInvoices[0]?.total || 0,
      pendingPaymentsCount: pendingInvoices[0]?.count || 0,
      monthlyRevenue: monthlyPayments[0]?.total || 0,
    },
    recentAppointments: isAccountant ? [] : recentAppointments,
    patientTypeBreakdown,
  });
}
