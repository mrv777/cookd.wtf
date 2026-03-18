"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function WalletInput({ referrer, autoFocus = false }: { referrer?: string; autoFocus?: boolean }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Paste a wallet address or ENS name");
        return;
      }
      const isEth = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
      const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
      const isEns = /^[a-zA-Z0-9-]+\.eth$/.test(trimmed);

      if (!isEth && !isSol && !isEns) {
        setError("Enter a valid ETH/SOL address or .eth name");
        return;
      }

      setError("");
      router.push(`/roast/${encodeURIComponent(trimmed)}`);
    },
    [input, router]
  );

  return (
    <form onSubmit={handleSubmit}>
      {referrer && (
        <div className="mb-4 border border-accent-orange/30 bg-accent-orange/5 px-4 py-3 font-mono text-xs text-accent-orange">
          Your friend just got roasted. Your turn.
        </div>
      )}

      <div className="flex gap-0">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="0x... or .eth or base58"
          className="flex-1 border border-border bg-bg-secondary px-4 py-4 font-mono text-sm text-text-primary placeholder:text-text-dim focus:border-accent-red focus:outline-none transition-colors"
          autoFocus={autoFocus}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-accent-red px-6 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-red-500 active:scale-[0.98]"
        >
          Roast
        </button>
      </div>

      {error && (
        <p className="mt-2 font-mono text-xs text-accent-red">{error}</p>
      )}
      <p className="mt-3 font-mono text-[11px] text-text-dim">
        ETH / Base / Solana — auto-detected
      </p>
    </form>
  );
}
