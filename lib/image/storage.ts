import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

function ensureDir(): void {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

function sanitizeAddress(address: string): string {
  return address.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

export function getImagePath(
  address: string,
  variant: "summary" | "archetype"
): string {
  return path.join(IMAGES_DIR, `${sanitizeAddress(address)}_${variant}.png`);
}

export function getImageUrl(
  address: string,
  variant: "summary" | "archetype"
): string {
  // Serve via the API route — Next.js standalone doesn't serve
  // runtime-generated files from the public/ volume as static assets
  if (variant === "summary") {
    return `/api/og/${encodeURIComponent(address)}`;
  }
  return `/api/og/${encodeURIComponent(address)}?variant=${variant}`;
}

export function saveImage(
  address: string,
  variant: "summary" | "archetype",
  buffer: Buffer | Uint8Array
): string {
  ensureDir();
  const filePath = getImagePath(address, variant);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function imageExists(
  address: string,
  variant: "summary" | "archetype"
): boolean {
  return fs.existsSync(getImagePath(address, variant));
}

export function deleteImages(address: string): void {
  for (const variant of ["summary", "archetype"] as const) {
    const p = getImagePath(address, variant);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      // ignore
    }
  }
}
