import { getCachedRoastByAddress } from "@/lib/cache/queries";
import { getArchetype } from "@/lib/roast/archetypes";
import type { RoastResult } from "@/lib/roast/types";
import { SummaryCard } from "./summary-card";
import { ArchetypeCard } from "./archetype-card";

interface Props {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function CardRenderPage({ params, searchParams }: Props) {
  const { address } = await params;
  const { variant = "summary" } = await searchParams;

  const cached = getCachedRoastByAddress(address);
  if (!cached) {
    return <FallbackCard address={address} />;
  }

  const roast: RoastResult = JSON.parse(cached.roast_json);
  const archetype = getArchetype(roast.archetype);
  const siteName = process.env.SITE_NAME || "cookd.wtf";

  if (variant === "archetype") {
    return (
      <ArchetypeCard roast={roast} archetype={archetype} siteName={siteName} />
    );
  }

  return (
    <SummaryCard roast={roast} archetype={archetype} siteName={siteName} />
  );
}

function FallbackCard({ address }: { address: string }) {
  const display = address.length > 20
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#0C0C0C",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#E0E0E0",
        padding: "48px 64px",
      }}
    >
      <div style={{ height: 6, background: "#FF4444", position: "absolute", top: 0, left: 0, right: 0 }} />
      <div style={{ fontSize: 13, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 24 }}>
        cookd.wtf
      </div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 56, fontWeight: 800, textTransform: "uppercase", lineHeight: 0.9, marginBottom: 24 }}>
        Getting
        <br />
        Cooked...
      </div>
      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
        {display}
      </div>
    </div>
  );
}
