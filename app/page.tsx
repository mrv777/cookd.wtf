import { WalletInput } from "@/components/WalletInput";
import { ExampleRoasts } from "@/components/ExampleRoasts";
import { getRecentRoasts } from "@/lib/cache/queries";
import type { RoastResult } from "@/lib/roast/types";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

function loadRecentRoasts() {
  try {
    const cached = getRecentRoasts(10);
    return cached.map((row) => {
      const roast: RoastResult = JSON.parse(row.roast_json);
      return {
        address: roast.address,
        displayAddress: roast.displayAddress,
        archetype: roast.archetype,
        archetypeName: roast.archetypeName,
        verdict: roast.verdict,
        overallScore: roast.overallScore,
      };
    });
  } catch {
    return [];
  }
}

export default async function Home({ searchParams }: Props) {
  const { ref } = await searchParams;
  const recentRoasts = loadRecentRoasts();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      {/* Header — left-aligned, brutalist */}
      <div className="mb-12">
        <p className="font-mono text-[11px] tracking-[0.3em] text-text-dim uppercase mb-4">
          Nansen-powered roast engine
        </p>
        <h1
          className="text-5xl sm:text-7xl font-extrabold uppercase leading-[0.85] tracking-tight"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          How <span className="text-accent-red">cooked</span>
          <br />
          are you?
        </h1>
        <p className="mt-6 font-mono text-sm text-text-secondary max-w-md leading-relaxed">
          Paste any wallet. We pull real on-chain data from Nansen,
          then roast your trading history. Share the damage.
        </p>
      </div>

      {/* Input */}
      <div className="mb-20">
        <WalletInput referrer={ref} autoFocus />
      </div>

      {/* Recent / Example Roasts */}
      <ExampleRoasts recentRoasts={recentRoasts} />

      {/* Footer */}
      <footer className="mt-24 border-t border-border pt-6">
        <div className="flex items-center justify-between font-mono text-[11px] text-text-dim">
          <span>Powered by Nansen</span>
          <span>For entertainment only.</span>
        </div>
      </footer>
    </main>
  );
}
