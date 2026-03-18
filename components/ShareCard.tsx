"use client";

import { getArchetype } from "@/lib/roast/archetypes";
import type { RoastResult } from "@/lib/roast/types";

function accentToDarkBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * 0.15);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#00FF88";
  if (grade.startsWith("B")) return "#00D4FF";
  if (grade.startsWith("C")) return "#FFD700";
  if (grade.startsWith("D")) return "#FF8C00";
  return "#FF4444";
}

interface Props {
  roast: RoastResult;
}

export function ShareCard({ roast }: Props) {
  const archetype = getArchetype(roast.archetype);
  const darkBg = accentToDarkBg(archetype.accentColor);
  const siteName = "cookd.wtf";
  const cats = roast.categories.slice(0, 4);

  return (
    <div
      id="share-card"
      className="relative overflow-hidden select-none"
      style={{ background: darkBg }}
    >
      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      {/* Accent stripe top */}
      <div className="h-1.5" style={{ background: archetype.accentColor }} />

      <div className="relative p-5 sm:p-7">
        {/* Row 1: Header */}
        <div className="flex items-baseline justify-between mb-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase">
            cookd.wtf
          </span>
          <span className="font-mono text-[10px] text-white/20">
            {roast.displayAddress}
          </span>
        </div>

        {/* Row 2: Archetype — big, left-aligned */}
        <h2
          className="text-4xl sm:text-5xl font-extrabold uppercase leading-[0.85] tracking-tight mb-5"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            color: archetype.accentColor,
          }}
        >
          {archetype.name}
        </h2>

        {/* Row 3: Grade stamps in a row — compact visual element */}
        <div className="flex gap-2 mb-5">
          {cats.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <span
                className="inline-flex h-6 w-9 items-center justify-center font-mono text-[10px] font-bold text-black"
                style={{ background: gradeColor(cat.grade) }}
              >
                {cat.grade}
              </span>
              <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider hidden sm:inline">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Row 4: Verdict — the hook */}
        <div className="border-l-2 pl-4 mb-6" style={{ borderColor: archetype.accentColor }}>
          <p className="font-mono text-[15px] sm:text-base leading-relaxed text-white/85">
            &ldquo;{roast.verdict}&rdquo;
          </p>
        </div>

        {/* Row 5: Score + URL */}
        <div className="flex items-end justify-between border-t border-white/8 pt-4">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-5xl sm:text-6xl font-extrabold leading-none"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                color: archetype.accentColor,
              }}
            >
              {roast.overallScore}
            </span>
            <span className="font-mono text-sm text-white/20">/100</span>
          </div>

          <div className="text-right">
            <span
              className="block font-mono text-[11px] font-bold tracking-wider"
              style={{ color: archetype.accentColor }}
            >
              {siteName}
            </span>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-wider">
              Powered by Nansen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
