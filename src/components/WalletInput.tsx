"use client";

import { useState } from "react";

interface WalletInputProps {
  onSubmit: (wallet: string) => void;
  loading: boolean;
}

export function WalletInput({ onSubmit, loading }: WalletInputProps) {
  const [wallet, setWallet] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = /^0x[0-9a-fA-F]{40}$/.test(wallet.trim());
  const showError = touched && wallet.length > 0 && !isValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (isValid) onSubmit(wallet.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-3">
      <div className="relative">
        <input
          type="text"
          value={wallet}
          onChange={(e) => {
            setWallet(e.target.value);
            setTouched(false);
          }}
          onBlur={() => setTouched(true)}
          placeholder="0x..."
          spellCheck={false}
          autoComplete="off"
          disabled={loading}
          className={`w-full bg-white/[0.04] border rounded-xl px-5 py-4 text-sm font-mono text-white placeholder:text-[#52525B] focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
            showError
              ? "border-red-500/60 focus:ring-red-500/40"
              : "border-white/10 focus:ring-white/20 focus:border-white/20"
          }`}
        />
        {wallet.length > 0 && (
          <button
            type="button"
            onClick={() => { setWallet(""); setTouched(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {showError && (
        <p className="text-xs text-red-400 px-1">
          Enter a valid Ethereum wallet address (0x…)
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !wallet}
        className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #d7ee88 0%, #a8b86a 100%)",
          color: "#0a0a0a",
          boxShadow: "0 0 24px rgba(215,238,136,0.15)",
        }}
      >
        {loading ? "Analysing…" : "Reveal My Card"}
      </button>
    </form>
  );
}
