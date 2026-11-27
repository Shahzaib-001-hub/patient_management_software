import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StoreOrder from "@/models/StoreOrder";
import Product from "@/models/Product";
import { getSessionUser } from "@/lib/auth";
import { requireAuth, ROLES } from "@/lib/permissions";
import { getNextSequence } from "@/lib/counters";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  await connectDB();
  const filter =
    user.role === ROLES.PATIENT ? { userId: user.userId } : {};

  if (
    user.role !== ROLES.PATIENT &&
    ![
      ROLES.SUPER_ADMIN,
      ROLES.CLINIC_ADMIN,
      ROLES.RECEPTIONIST,
      ROLES.ACCOUNTANT,
      ROLES.REHAB_STAFF,
    ].includes(user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await StoreOrder.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders });
}

export async function POST(req) {
  await connectDB();
  const sessionUser = await getSessionUser();
  const body = await req.json();

  const {
    customerName,
    customerPhone,
    customerEmail = "",
    shippingAddress,
    items = [],
    paymentMethod = "cash_on_delivery",
    notes = "",
  } = body;

  if (!customerName || !customerPhone || !shippingAddress || !items.length) {
    return NextResponse.json(
      { error: "Customer details, shipping address, and cart items are required" },
      { status: 400 }
    );
  }

  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: `Product not available: ${item.name || item.productId}` },
        { status: 400 }
      );
    }
    const qty = Math.max(1, Number(item.quantity || 1));
    if (product.stockQuantity < qty) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 409 }
      );
    }
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    verifiedItems.push({
      productId: product._id,
      name: product.name,
      quantity: qty,
      unitPrice: product.price,
      total: lineTotal,
    });
    product.stockQuantity -= qty;
    await product.save();
  }

  const shippingFee = paymentMethod === "clinic_pickup" ? 0 : 250;
  const totalAmount = subtotal + shippingFee;
  const orderNumber = await getNextSequence("ORD");

  const order = await StoreOrder.create({
    orderNumber,
    userId: sessionUser?.userId || null,
    patientId: sessionUser?.patientProfileId || null,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail.trim(),
    shippingAddress: shippingAddress.trim(),
    items: verifiedItems,
    subtotal,
    shippingFee,
    totalAmount,
    currency: "PKR",
    paymentMethod,
    notes,
  });

  if (sessionUser) {
    await logAudit({
      user: sessionUser,
      action: "CREATE_STORE_ORDER",
      resourceType: "StoreOrder",
      resourceId: order._id,
      patientId: sessionUser.patientProfileId || null,
      details: `Placed store order ${orderNumber} (PKR ${totalAmount})`,
      req,
    });
  }

  return NextResponse.json({ order }, { status: 201 });
}
