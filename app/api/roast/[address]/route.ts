import { NextRequest, NextResponse } from "next/server";
import { parseAddressInput, isEvmAddress } from "@/lib/utils/address";
import { detectEvmChain } from "@/lib/utils/chain-detect";
import { getCachedRoast, getCachedRoastByAddress, setCachedRoast } from "@/lib/cache/queries";
import { deleteImages } from "@/lib/image/storage";
import { isRateLimited } from "@/lib/rate-limit/limiter";
import { canAffordRoast, recordRoastCost } from "@/lib/budget/tracker";
import { executePhase0, executePhaseA, executePhaseB } from "@/lib/nansen/endpoints";
import type { Phase0Results, PhaseAResults } from "@/lib/nansen/endpoints";
import { processNansenData } from "@/lib/nansen/data-processor";
import { generateRoast } from "@/lib/roast/generator";
import { renderBothCards } from "@/lib/image/renderer";
import { getImageUrl } from "@/lib/image/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const decoded = decodeURIComponent(address);

  // 1. Validate address
  const info = parseAddressInput(decoded);
  if (!info) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  // 2. Check cache FIRST (chain-agnostic) — no credits, no rate limit needed
  const anyCached = getCachedRoastByAddress(info.address);
  if (anyCached) {
    return NextResponse.json({
      ...JSON.parse(anyCached.roast_json),
      summaryCardUrl: anyCached.summary_card_path
        ? getImageUrl(info.address, "summary")
        : null,
      archetypeCardUrl: anyCached.archetype_card_path
        ? getImageUrl(info.address, "archetype")
        : null,
      fromCache: true,
    });
  }

  // 3. Detect chain for EVM addresses via public RPCs (free)
  let chain = info.chain;
  if (isEvmAddress(decoded)) {
    chain = await detectEvmChain(decoded);
  }

  // 4. Rate limit check
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = isRateLimited(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limited",
        message: `Too many roasts. Try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
        resetIn: rateLimit.resetIn,
      },
      { status: 429 }
    );
  }

  // 5. Budget check
  if (!canAffordRoast()) {
    return NextResponse.json(
      {
        error: "At capacity",
        message: "We're at capacity for today! Come back tomorrow.",
      },
      { status: 503 }
    );
  }

  try {
    // 6. Phase 0 — cheap probe (20 credits on free plan)
    const phase0 = await executePhase0(info.address, chain);

    // 7. Check for API-level failures
    const apiError = checkPhase0Errors(phase0);
    if (apiError) {
      return NextResponse.json(
        { error: apiError.error, message: apiError.message },
        { status: apiError.status }
      );
    }

    // 8. Dead wallet? Return early — save 240+ credits
    if (phase0.activityLevel === "dead") {
      const roastInput = processNansenData(info.address, chain, {
        ...phase0,
        balance: { success: false, data: null as never, error: "skipped" },
        historicalBalances: { success: false, data: null as never, error: "skipped" },
        counterparties: { success: false, data: null as never, error: "skipped" },
      }, null);

      const roast = await generateRoast(roastInput);
      const roastJson = JSON.stringify(roast);
      setCachedRoast(chain, info.address, roastJson);
      recordRoastCost(20); // Phase 0 only = 20 credits

      return NextResponse.json({
        ...roast,
        summaryCardUrl: null,
        archetypeCardUrl: null,
        fromCache: false,
      });
    }

    // 9. Phase A — remaining wallet-level calls (20-70 credits)
    const phaseA = await executePhaseA(info.address, chain, phase0);

    // 10. Phase B — token-specific calls (40-60 credits, conditional)
    const phaseB = await executePhaseB(info.address, chain, phaseA);

    // 11. Process data into roast input
    const roastInput = processNansenData(info.address, chain, phaseA, phaseB);

    // 12. Generate roast via Gemini
    const roast = await generateRoast(roastInput);

    // 13. Cache the roast (delete stale images first)
    deleteImages(info.address);
    const roastJson = JSON.stringify(roast);
    setCachedRoast(chain, info.address, roastJson);

    // 14. Record budget usage
    recordRoastCost();

    // 15. Render card images (async, don't block response)
    const origin = request.nextUrl.origin;
    renderBothCards(info.address, origin)
      .then(({ summaryPath, archetypePath }) => {
        setCachedRoast(chain, info.address, roastJson, summaryPath, archetypePath);
      })
      .catch((err) => console.error("Card render failed:", err));

    return NextResponse.json({
      ...roast,
      summaryCardUrl: null,
      archetypeCardUrl: null,
      fromCache: false,
    });
  } catch (err) {
    console.error("Roast generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate roast", message: String(err) },
      { status: 500 }
    );
  }
}

function checkPhase0Errors(
  phase0: Phase0Results
): { error: string; message: string; status: number } | null {
  const results = [phase0.pnlSummary, phase0.transactions];
  const failures = results.filter((r) => !r.success);

  // If at least one succeeded, we can work with partial data
  if (failures.length < results.length) return null;

  // ALL calls failed — check why
  const firstError = failures[0]?.error ?? "";
  const firstCode = failures[0]?.code ?? "";

  if (
    firstError.includes("Insufficient credits") ||
    firstCode === "CREDITS_EXHAUSTED"
  ) {
    return {
      error: "Nansen API credits exhausted",
      message:
        "We've run out of Nansen API credits. Please try again later or contact us.",
      status: 503,
    };
  }

  if (firstCode === "UNAUTHORIZED" || firstError.includes("401")) {
    return {
      error: "Nansen API authentication failed",
      message: "API key issue. Please try again later.",
      status: 503,
    };
  }

  if (firstError.includes("429") || firstError.includes("rate limit")) {
    return {
      error: "Nansen API rate limited",
      message: "Too many requests to Nansen. Please wait a moment and try again.",
      status: 429,
    };
  }

  return {
    error: "Nansen API unavailable",
    message: `Unable to fetch wallet data: ${firstError.slice(0, 100)}`,
    status: 502,
  };
}
