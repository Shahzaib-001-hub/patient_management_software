import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import Notification from "@/models/Notification";
import Patient from "@/models/Patient";
import { requirePermission, ROLES } from "@/lib/permissions";
import { getNextSequence } from "@/lib/counters";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_BILLING");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("invoiceId");
  const filter = {};
  if (invoiceId) filter.invoiceId = invoiceId;
  if (user.role === ROLES.PATIENT) filter.patientId = user.patientProfileId;

  const payments = await Payment.find(filter)
    .sort({ paidAt: -1 })
    .populate("patientId", "patientId personalInfo")
    .populate("invoiceId", "invoiceNumber totalAmount")
    .populate("recordedBy", "name")
    .lean();

  return NextResponse.json({ payments });
}

export async function POST(req) {
  const { error, user } = await requirePermission("MANAGE_BILLING");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const {
    invoiceId,
    amount,
    method = "cash",
    type = "payment",
    reference = "",
    notes = "",
  } = body;

  const numAmount = Number(amount);
  if (!invoiceId || !numAmount || numAmount <= 0) {
    return NextResponse.json(
      { error: "Valid invoice and positive amount are required" },
      { status: 400 }
    );
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const receiptNumber = await getNextSequence("RCP");
  const payment = await Payment.create({
    receiptNumber,
    invoiceId: invoice._id,
    patientId: invoice.patientId,
    amount: numAmount,
    currency: invoice.currency,
    method,
    type,
    reference,
    notes,
    recordedBy: user.userId,
    paidAt: new Date(),
  });

  if (type === "refund") {
    invoice.paidAmount = Math.max(0, invoice.paidAmount - numAmount);
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    invoice.status = invoice.paidAmount === 0 ? "refunded" : "partial";
  } else {
    invoice.paidAmount += numAmount;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    invoice.status = invoice.balanceDue === 0 ? "paid" : "partial";
  }

  await invoice.save();

  const patientDoc = await Patient.findById(invoice.patientId).lean();
  if (patientDoc?.userId && type === "payment") {
    await Notification.create({
      userId: patientDoc.userId,
      patientId: invoice.patientId,
      type: "payment_confirmed",
      title: "Payment Receipt Issued",
      message: `Payment of ${invoice.currency} ${numAmount} received for ${invoice.invoiceNumber}. Receipt: ${receiptNumber}`,
    });
  }

  await logAudit({
    user,
    action: type === "refund" ? "RECORD_REFUND" : "RECORD_PAYMENT",
    resourceType: "Payment",
    resourceId: payment._id,
    patientId: invoice.patientId,
    details: `${type} ${invoice.currency} ${numAmount} via ${method} (${receiptNumber})`,
    req,
  });

  return NextResponse.json({ payment, invoice }, { status: 201 });
}
