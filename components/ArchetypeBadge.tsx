"use client";

import { getArchetype } from "@/lib/roast/archetypes";

interface Props {
  archetypeId: string;
  score: number;
}

export function ArchetypeBadge({ archetypeId, score }: Props) {
  const archetype = getArchetype(archetypeId);

  return (
    <div
      className="relative overflow-hidden py-12 px-8 text-center"
      style={{ background: `${archetype.accentColor}0A` }}
    >
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      <div className="relative">
        <p className="font-mono text-[10px] tracking-[0.3em] text-text-dim uppercase mb-3">
          Your archetype
        </p>

        <h2
          className="text-4xl sm:text-5xl font-extrabold uppercase leading-[0.9] tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            color: archetype.accentColor,
          }}
        >
          {archetype.name}
        </h2>

        <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-text-secondary">
          {archetype.description}
        </p>

        {/* Score — big number */}
        <div className="mt-8 inline-block border-2 px-6 py-3" style={{ borderColor: archetype.accentColor }}>
          <span
            className="text-4xl font-extrabold leading-none"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              color: archetype.accentColor,
            }}
          >
            {score}
          </span>
          <span className="font-mono text-sm text-text-dim">/100</span>
        </div>
      </div>
    </div>
  );
}
