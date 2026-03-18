import Link from "next/link";
import { ARCHETYPES } from "@/lib/roast/archetypes";
import type { RoastResult } from "@/lib/roast/types";

const FALLBACK_EXAMPLES = [
  {
    address: "vitalik.eth",
    displayAddress: "vitalik.eth",
    archetype: "diamond_corpse",
    archetypeName: "The Diamond Corpse",
    verdict: "Held ETH from $1 to $4,800 to $880 and back. That's not investing, that's a relationship.",
    overallScore: 84,
  },
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    displayAddress: "0xd8dA...6045",
    archetype: "chain_hopper",
    archetypeName: "The Chain Hopper",
    verdict: "Active on 12 chains. Diversifying your gas fees across blockchains.",
    overallScore: 91,
  },
  {
    address: "CryptoNovo.sol",
    displayAddress: "CryptoNovo.sol",
    archetype: "fomo_farmer",
    archetypeName: "The FOMO Farmer",
    verdict: "Bought every top. Sold every bottom. Consistency is a skill.",
    overallScore: 37,
  },
];

interface RoastEntry {
  address: string;
  displayAddress: string;
  archetype: string;
  archetypeName: string;
  verdict: string;
  overallScore: number;
}

interface Props {
  recentRoasts?: RoastEntry[];
}

export function ExampleRoasts({ recentRoasts }: Props) {
  const entries = recentRoasts && recentRoasts.length > 0
    ? recentRoasts
    : FALLBACK_EXAMPLES;

  const label = recentRoasts && recentRoasts.length > 0
    ? "Recent roasts"
    : "Example roasts";

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">
        {label}
      </p>
      <div className="space-y-0 border-t border-border">
        {entries.map((entry) => {
          const arch = ARCHETYPES[entry.archetype];
          const accentColor = arch?.accentColor ?? "#8899AA";

          return (
            <Link
              key={entry.address}
              href={`/roast/${encodeURIComponent(entry.address)}`}
              className="group flex items-start gap-4 border-b border-border py-4 transition-colors hover:bg-bg-secondary"
            >
              {/* Score */}
              <span
                className="inline-flex h-7 w-10 shrink-0 items-center justify-center font-mono text-xs font-bold text-black"
                style={{ background: accentColor }}
              >
                {entry.overallScore}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-xs text-text-secondary">
                    {entry.displayAddress}
                  </span>
                  <span
                    className="font-mono text-[10px] font-bold uppercase"
                    style={{ color: accentColor }}
                  >
                    {arch?.name ?? entry.archetypeName}
                  </span>
                </div>
                <p className="font-mono text-xs text-text-secondary/70 leading-relaxed truncate">
                  &ldquo;{entry.verdict}&rdquo;
                </p>
              </div>

              <span className="font-mono text-[11px] text-text-dim group-hover:text-text-secondary transition-colors">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
