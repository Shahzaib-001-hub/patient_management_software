import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAuth, ROLES } from "@/lib/permissions";

export async function POST(req) {
  const { error } = await requireAuth([
    ROLES.SUPER_ADMIN,
    ROLES.CLINIC_ADMIN,
    ROLES.DOCTOR,
    ROLES.REHAB_STAFF,
  ]);
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name || ".png").replace(/[^a-zA-Z0-9.]/g, "") || ".png";
  const fileName = `prod-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const targetDir = path.join(process.cwd(), "public", "images", "store");
  await fs.mkdir(targetDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(targetDir, fileName), buffer);

  return NextResponse.json({ imageUrl: `/images/store/${fileName}` }, { status: 201 });
}
