import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAuth, ROLES } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeInactive = searchParams.get("includeInactive") === "true";

  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (category && category !== "all") filter.category = category;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req) {
  const { error, user } = await requireAuth([
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.REHAB_STAFF,
  ]);
  if (error) return error;

  await connectDB();
  const body = await req.json();
  if (!body.name || !body.sku || !body.category || body.price === undefined) {
    return NextResponse.json(
      { error: "Name, SKU, category, and price are required" },
      { status: 400 }
    );
  }

  const product = await Product.create({
    ...body,
    price: Number(body.price),
    stockQuantity: Number(body.stockQuantity || 0),
    createdBy: user.userId,
  });

  await logAudit({
    user,
    action: "CREATE_PRODUCT",
    resourceType: "Product",
    resourceId: product._id,
    details: `Added store product ${product.name} (${product.sku})`,
    req,
  });

  return NextResponse.json({ product }, { status: 201 });
}
