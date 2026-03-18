import type { RoastResult } from "@/lib/roast/types";
import type { Archetype } from "@/lib/roast/archetypes";

interface Props {
  roast: RoastResult;
  archetype: Archetype;
  siteName: string;
}

function accentToDarkBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * 0.12);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function ArchetypeCard({ roast, archetype, siteName }: Props) {
  const darkBg = accentToDarkBg(archetype.accentColor);
  const mono = "var(--font-mono), 'JetBrains Mono', monospace";
  const display = "var(--font-display), Syne, sans-serif";

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: darkBg,
        position: "relative",
        overflow: "hidden",
        fontFamily: mono,
        color: "#E0E0E0",
      }}
    >
      {/* Noise grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      {/* Accent stripe top */}
      <div style={{ height: 6, background: archetype.accentColor }} />

      {/* Content */}
      <div
        style={{
          position: "relative",
          padding: "48px 64px 48px",
          height: "calc(100% - 6px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Your Archetype
        </div>

        {/* Name — massive */}
        <div
          style={{
            fontFamily: display,
            fontSize: 80,
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 0.85,
            color: archetype.accentColor,
            marginBottom: 32,
          }}
        >
          {archetype.name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 800,
            marginBottom: 40,
          }}
        >
          {archetype.description}
        </div>

        {/* Score + URL — bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: display,
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1,
                color: archetype.accentColor,
              }}
            >
              {roast.overallScore}
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>
              /100
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: archetype.accentColor,
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Powered by Nansen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
