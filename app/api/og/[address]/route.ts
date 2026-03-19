import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getImagePath } from "@/lib/image/storage";
import { parseAddressInput } from "@/lib/utils/address";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const decoded = decodeURIComponent(address);
  const info = parseAddressInput(decoded);
  const variant = request.nextUrl.searchParams.get("variant") === "archetype"
    ? "archetype" as const
    : "summary" as const;

  // Try to serve pre-generated card
  const filePath = getImagePath(info?.address ?? decoded, variant);

  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": String(buffer.length),
      },
    });
  }

  // Serve generic fallback card
  const fallbackPath = getImagePath("fallback", "summary");
  if (fs.existsSync(fallbackPath)) {
    const buffer = fs.readFileSync(fallbackPath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // No image available — redirect to a placeholder
  return NextResponse.json(
    { error: "OG image not yet generated" },
    { status: 404 }
  );
}
