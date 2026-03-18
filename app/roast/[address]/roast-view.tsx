"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { ShareCard } from "@/components/ShareCard";
import { RoastCard } from "@/components/RoastCard";
import { ShareButtons } from "@/components/ShareButtons";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { ArchetypeBadge } from "@/components/ArchetypeBadge";
import { WalletInput } from "@/components/WalletInput";
import type { RoastResult } from "@/lib/roast/types";

interface RoastApiResponse extends RoastResult {
  summaryCardUrl?: string | null;
  archetypeCardUrl?: string | null;
  fromCache?: boolean;
  error?: string;
  message?: string;
}

export function RoastView({ address }: { address: string }) {
  const [roast, setRoast] = useState<RoastApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoast() {
      try {
        const res = await fetch(`/api/roast/${encodeURIComponent(address)}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.message || data.error || "Failed to generate roast");
          setLoading(false);
          return;
        }

        setRoast(data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("Network error. Please try again.");
        setLoading(false);
      }
    }

    fetchRoast();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center px-4">
        <p className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">
          Error
        </p>
        <h1
          className="text-3xl font-extrabold uppercase mb-4"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          {error.includes("credits") ? "Out of Credits" : error.includes("Rate") ? "Slow Down" : "Something Broke"}
        </h1>
        <p className="font-mono text-sm text-text-secondary mb-8 leading-relaxed">
          {error.includes("credits")
            ? "We've burned through our Nansen API credits for now. Come back soon."
            : error.includes("Rate")
              ? "Too many roasts. Take a breather."
              : error}
        </p>
        <Link
          href="/"
          className="border border-border px-5 py-3 font-mono text-xs text-text-primary transition-all hover:bg-bg-secondary"
        >
          ← Back
        </Link>
      </main>
    );
  }

  if (!roast) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-block font-mono text-xs text-text-dim hover:text-text-secondary transition-colors"
      >
        ← Back
      </Link>

      {/* Share Card — the hero, optimized for screenshots */}
      <div className="mb-4">
        <ShareCard roast={roast} />
      </div>

      {/* Share buttons — immediately after the shareable card */}
      <div className="mb-12">
        <ShareButtons roast={roast} siteUrl={siteUrl} />
      </div>

      {/* Detailed breakdown — below the fold */}
      <div className="mb-8">
        <RoastCard roast={roast} imageUrl={roast.summaryCardUrl} />
      </div>

      {/* Archetype */}
      <div className="mb-12">
        <ArchetypeBadge
          archetypeId={roast.archetype}
          score={roast.overallScore}
        />
      </div>

      {/* Category details */}
      <div className="mb-12">
        <CategoryBreakdown categories={roast.categories} />
      </div>

      {/* Roast a Friend */}
      <div className="mb-12 border border-border p-6">
        <p
          className="text-xl font-extrabold uppercase mb-2"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Roast a Friend
        </p>
        <p className="font-mono text-xs text-text-secondary mb-4">
          Think you&apos;re bad? Let&apos;s see if they&apos;re worse.
        </p>
        <WalletInput />
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-6 pb-8">
        <div className="flex items-center justify-between font-mono text-[11px] text-text-dim">
          <span>Powered by Nansen</span>
          <span>For entertainment only.</span>
        </div>
      </footer>
    </main>
  );
}
