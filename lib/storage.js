import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PRIVATE_UPLOAD_DIR = path.join(process.cwd(), "private_uploads");

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadPrivateFile({ buffer, originalName, mimeType, folder = "medical_records" }) {
  const safeExt = path.extname(originalName || "").replace(/[^a-zA-Z0-9.]/g, "");
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  if (isCloudinaryConfigured()) {
    const resourceType = mimeType?.startsWith("video/")
      ? "video"
      : mimeType?.startsWith("image/")
      ? "image"
      : "raw";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `prwc/${folder}`,
          public_id: uniqueId,
          type: "authenticated",
          resource_type: resourceType,
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
      stream.end(buffer);
    });

    return {
      storageProvider: "cloudinary",
      storageKey: result.public_id,
      resourceType,
      bytes: result.bytes || buffer.length,
    };
  }

  // Local private storage fallback (outside public/, never directly served)
  const targetDir = path.join(PRIVATE_UPLOAD_DIR, folder);
  await fs.mkdir(targetDir, { recursive: true });
  const fileName = `${uniqueId}${safeExt}`;
  const fullPath = path.join(targetDir, fileName);
  await fs.writeFile(fullPath, buffer);

  return {
    storageProvider: "local",
    storageKey: path.join(folder, fileName),
    resourceType: mimeType?.startsWith("video/")
      ? "video"
      : mimeType?.startsWith("image/")
      ? "image"
      : "raw",
    bytes: buffer.length,
  };
}

export async function readPrivateFile({ storageProvider, storageKey, resourceType = "raw" }) {
  if (storageProvider === "cloudinary" && isCloudinaryConfigured()) {
    const signedUrl = cloudinary.url(storageKey, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 120,
    });
    return { type: "redirect", url: signedUrl };
  }

  const normalized = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(PRIVATE_UPLOAD_DIR, normalized);
  const buffer = await fs.readFile(fullPath);
  return { type: "buffer", buffer };
}
