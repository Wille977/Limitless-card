"use client";

import { TraderCard } from "./TraderCard";
import type { TraderCardData } from "@/lib/types";

interface CardRevealProps {
  cardData: TraderCardData;
  motivation: string;
  onReset: () => void;
}

export function CardReveal({ cardData, motivation, onReset }: CardRevealProps) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `I'm ${cardData.card.title} on Limitless Exchange`,
        text: motivation,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${motivation}\n\nDiscover your trader archetype at limitless.exchange`
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Motivation text */}
      <p className="max-w-[560px] text-center text-sm sm:text-base text-[#A1A1AA] italic leading-relaxed">
        &ldquo;{motivation}&rdquo;
      </p>

      {/* Card */}
      <TraderCard data={cardData} />

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleShare}
          className="px-6 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #d7ee88 0%, #a8b86a 100%)",
            color: "#0a0a0a",
            boxShadow: "0 0 24px rgba(215,238,136,0.15)",
          }}
        >
          Share Card
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl font-semibold text-sm tracking-wide border border-white/10 text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all duration-200"
        >
          Try Another
        </button>
      </div>
    </div>
  );
}
