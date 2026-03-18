"use client";

import { useState, useEffect } from "react";

const WITTY_MESSAGES = [
  "Scanning your questionable life choices...",
  "Cross-referencing with Smart Money (you're not one of them)...",
  "Calculating how many times you bought the top...",
  "Measuring your diamond hands (or paper hands)...",
  "Analyzing your 3AM trading decisions...",
  "Comparing you to actual smart traders...",
  "Generating maximum emotional damage...",
  "Finding your worst trade (so many candidates)...",
  "Quantifying your degen level...",
  "Checking if Smart Money ever agreed with you...",
  "Preparing your roast for Twitter...",
];

export function LoadingState() {
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        if (p < 30) return p + Math.random() * 8;
        if (p < 70) return p + Math.random() * 3;
        return p + Math.random() * 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % WITTY_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-start justify-center px-4">
      <p className="font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase mb-4">
        Generating roast
      </p>

      {/* Progress bar — sharp, no rounded corners */}
      <div className="mb-4 h-1 w-full bg-border">
        <div
          className="h-full bg-accent-red transition-all duration-300"
          style={{ width: `${Math.min(progress, 95)}%` }}
        />
      </div>

      {/* Message */}
      <p className="font-mono text-sm text-text-secondary">
        {WITTY_MESSAGES[messageIdx]}
      </p>
    </div>
  );
}
