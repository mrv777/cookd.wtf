"use client";

import Image from "next/image";
import { getArchetype } from "@/lib/roast/archetypes";
import type { RoastResult } from "@/lib/roast/types";

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

/**
 * Derive a dark shade from the archetype accent for the card background.
 * This keeps the hue identity without needing a heavy black overlay.
 */
function accentToDarkBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Mix toward near-black, keeping hue
  const mix = (c: number) => Math.round(c * 0.18);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

interface Props {
  roast: RoastResult;
  imageUrl?: string | null;
}

export function RoastCard({ roast, imageUrl }: Props) {
  const archetype = getArchetype(roast.archetype);

  if (imageUrl) {
    return (
      <div className="overflow-hidden shadow-2xl">
        <Image
          src={imageUrl}
          alt={`Cookd: ${roast.displayAddress}`}
          data-roast-card=""
          className="w-full"
          width={1200}
          height={630}
          unoptimized
        />
      </div>
    );
  }

  const darkBg = accentToDarkBg(archetype.accentColor);

  return (
    <div className="relative overflow-hidden" style={{ background: darkBg }}>
      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      {/* Accent edge — a bold stripe at the top */}
      <div className="h-1" style={{ background: archetype.accentColor }} />

      <div className="relative p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-baseline justify-between mb-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase">
            cookd.wtf
          </span>
          <span className="font-mono text-[10px] text-white/25">
            {roast.displayAddress}
          </span>
        </div>

        {/* Archetype — big, accent colored */}
        <h2
          className="text-3xl sm:text-4xl font-extrabold uppercase leading-[0.9] tracking-tight mb-5"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            color: archetype.accentColor,
          }}
        >
          {archetype.name}
        </h2>

        {/* Grade rows — compact, monochrome bars */}
        <div className="mb-5 border-t border-white/8">
          {roast.categories.slice(0, 4).map((cat) => (
            <div
              key={cat.name}
              className="flex items-start gap-3 border-b border-white/6 py-2.5"
            >
              {/* Grade stamp */}
              <div
                className="flex h-7 w-11 shrink-0 items-center justify-center font-mono text-[11px] font-bold"
                style={{ background: gradeColor(cat.grade), color: "#000" }}
              >
                {cat.grade}
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-white/30 uppercase">
                    {cat.name}
                  </span>
                  <div className="h-[2px] flex-1 bg-white/6">
                    <div
                      className="h-full bg-white/20"
                      style={{ width: `${gradeToPercent(cat.grade)}%` }}
                    />
                  </div>
                </div>
                <p className="font-mono text-[12px] leading-snug text-white/70">
                  {cat.cardRoast}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div
          className="mb-5 border-l-2 pl-3 py-1"
          style={{ borderColor: archetype.accentColor }}
        >
          <p className="font-mono text-[13px] leading-relaxed text-white/80">
            {roast.verdict}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between border-t border-white/8 pt-3">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl font-extrabold leading-none"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                color: archetype.accentColor,
              }}
            >
              {roast.overallScore}
            </span>
            <span className="font-mono text-xs text-white/25">/100</span>
          </div>
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-wider">
            Powered by Nansen
          </span>
        </div>
      </div>
    </div>
  );
}
