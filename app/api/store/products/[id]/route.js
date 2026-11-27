import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

const STORE_MANAGERS = [
  ROLES.SUPER_ADMIN,
  ROLES.CLINIC_ADMIN,
  ROLES.DOCTOR,
  ROLES.REHAB_STAFF,
];

export async function PATCH(req, { params }) {
  const { error } = await requireAuth(STORE_MANAGERS);
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const product = await Product.findByIdAndUpdate(id, body, {
    returnDocument: "after",
  }).lean();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const { error, user } = await requireAuth(STORE_MANAGERS);
  if (error) return error;

  await connectDB();
  const { id } = await params;

  const product = await Product.findByIdAndDelete(id).lean();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await logAudit({
    user,
    action: "DELETE_PRODUCT",
    resourceType: "Product",
    resourceId: id,
    details: `Deleted store product ${product.name} (${product.sku})`,
    req,
  });

  return NextResponse.json({ success: true });
}
