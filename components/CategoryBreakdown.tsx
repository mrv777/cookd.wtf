"use client";

import type { RoastCategory } from "@/lib/roast/types";

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#00D4FF";
  if (grade.startsWith("B")) return "#00FF88";
  if (grade.startsWith("C")) return "#FFD700";
  if (grade.startsWith("D")) return "#FF8C00";
  return "#FF4444";
}

interface Props {
  categories: RoastCategory[];
}

export function CategoryBreakdown({ categories }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">
        Detailed breakdown
      </p>
      <div className="space-y-0 border-t border-border">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="border-b border-border py-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="inline-flex h-7 w-12 items-center justify-center font-mono text-xs font-bold text-black"
                style={{ background: gradeColor(cat.grade) }}
              >
                {cat.grade}
              </span>
              <span className="font-mono text-sm font-bold uppercase tracking-wider">
                {cat.name}
              </span>
            </div>
            <p className="font-mono text-sm leading-relaxed text-text-secondary">
              {cat.detailRoast}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
