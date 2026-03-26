"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Pulling your on-chain data…",
  "Analysing trade history…",
  "Cross-referencing market categories…",
  "Calculating win rate…",
  "Measuring position sizing…",
  "Consulting the oracle…",
  "Classifying your archetype…",
  "Rendering your card…",
];

export function LoadingCard() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-[500px] sm:max-w-[600px] aspect-[16/10] rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center gap-6"
      style={{
        background: "linear-gradient(135deg, #1f1f1f 0%, #0d0d0d 50%, #050505 100%)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.75)",
      }}
    >
      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#d7ee88", borderRightColor: "#d7ee88" + "44" }}
        />
      </div>

      {/* Cycling message */}
      <p
        key={msgIdx}
        className="text-xs tracking-wider text-[#A1A1AA] uppercase animate-fade-in"
      >
        {MESSAGES[msgIdx]}
      </p>
    </div>
  );
}
