import type { RoastResult } from "@/lib/roast/types";
import type { Archetype } from "@/lib/roast/archetypes";

interface Props {
  roast: RoastResult;
  archetype: Archetype;
  siteName: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#00FF88";
  if (grade.startsWith("B")) return "#00D4FF";
  if (grade.startsWith("C")) return "#FFD700";
  if (grade.startsWith("D")) return "#FF8C00";
  return "#FF4444";
}

function gradeToPercent(grade: string): number {
  const map: Record<string, number> = {
    "A+": 98, A: 92, "A-": 87, "B+": 82, B: 77, "B-": 72,
    "C+": 67, C: 62, "C-": 57, "D+": 50, D: 42, "D-": 35,
    F: 22, "F-": 10,
  };
  return map[grade] ?? 50;
}

function accentToDarkBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * 0.15);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function SummaryCard({ roast, archetype, siteName }: Props) {
  const cats = roast.categories.slice(0, 4);
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
          padding: "36px 56px 40px",
          height: "calc(100% - 6px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
            }}
          >
            cookd.wtf
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
            {roast.displayAddress}
          </span>
        </div>

        {/* Archetype name — hero */}
        <div
          style={{
            fontFamily: display,
            fontSize: 64,
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 0.85,
            letterSpacing: "-0.01em",
            color: archetype.accentColor,
            marginBottom: 24,
          }}
        >
          {archetype.name}
        </div>

        {/* Grade stamps row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {cats.map((cat) => (
            <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 32,
                  background: gradeColor(cat.grade),
                  color: "#000",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: mono,
                }}
              >
                {cat.grade}
              </div>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                }}
              >
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div
          style={{
            borderLeft: `3px solid ${archetype.accentColor}`,
            paddingLeft: 20,
            marginBottom: 24,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 900,
            }}
          >
            &ldquo;{roast.verdict}&rdquo;
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20,
          }}
        >
          {/* Score */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: display,
                fontSize: 72,
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

          {/* URL + branding */}
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
