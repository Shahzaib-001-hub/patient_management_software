import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StoreOrder from "@/models/StoreOrder";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function PATCH(req, { params }) {
  const { error, user } = await requireAuth([
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.ACCOUNTANT,
  ]);
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const updates = {};
  if (body.orderStatus) updates.orderStatus = body.orderStatus;
  if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;

  const order = await StoreOrder.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
  }).lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await logAudit({
    user,
    action: "UPDATE_STORE_ORDER",
    resourceType: "StoreOrder",
    resourceId: id,
    details: `Order ${order.orderNumber} -> ${order.orderStatus} / ${order.paymentStatus}`,
    req,
  });

  return NextResponse.json({ order });
}
