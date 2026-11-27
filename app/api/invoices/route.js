import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { requirePermission, ROLES } from "@/lib/permissions";
import { getNextSequence } from "@/lib/counters";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  const { error, user } = await requirePermission("VIEW_BILLING");
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");
  const status = searchParams.get("status");

  const filter = {};
  if (user.role === ROLES.PATIENT) {
    filter.patientId = user.patientProfileId;
  } else if (patientId) {
    filter.patientId = patientId;
  }
  if (status && status !== "all") filter.status = status;

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "patientId personalInfo contact")
    .lean();

  return NextResponse.json({ invoices });
}

export async function POST(req) {
  const { error, user } = await requirePermission("MANAGE_BILLING");
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const {
    patientId,
    appointmentId = null,
    category = "initial_consultation",
    items = [],
    discount = 0,
    currency = "PKR",
    dueDate,
    notes = "",
  } = body;

  if (!patientId || !items.length) {
    return NextResponse.json(
      { error: "Patient and at least one invoice line item are required" },
      { status: 400 }
    );
  }

  const normalizedItems = items.map((item) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.unitPrice || 0);
    return {
      description: item.description,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };
  });

  const subtotal = normalizedItems.reduce((sum, i) => sum + i.total, 0);
  const disc = Number(discount || 0);
  const totalAmount = Math.max(0, subtotal - disc);

  const invoiceNumber = await getNextSequence("INV");
  const invoice = await Invoice.create({
    invoiceNumber,
    patientId,
    appointmentId: appointmentId || null,
    category,
    items: normalizedItems,
    subtotal,
    discount: disc,
    discountAuthorizedBy: disc > 0 ? user.userId : null,
    totalAmount,
    paidAmount: 0,
    balanceDue: totalAmount,
    currency,
    status: totalAmount === 0 ? "paid" : "unpaid",
    dueDate: dueDate ? new Date(dueDate) : new Date(),
    notes,
    createdBy: user.userId,
  });

  await logAudit({
    user,
    action: "CREATE_INVOICE",
    resourceType: "Invoice",
    resourceId: invoice._id,
    patientId,
    details: `Created invoice ${invoiceNumber} (${currency} ${totalAmount})`,
    req,
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
