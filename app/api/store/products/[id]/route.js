import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAuth, ROLES } from "@/lib/permissions";

export async function PATCH(req, { params }) {
  const { error } = await requireAuth([
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.REHAB_STAFF,
  ]);
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
