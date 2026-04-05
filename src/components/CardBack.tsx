"use client";

export function CardBack() {
  return (
    <div
      className="w-full h-full rounded-[20px] overflow-hidden relative"
      style={{
        background:
          "linear-gradient(145deg, #111111 0%, #0a0a0a 40%, #060606 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Holographic shimmer sweep */}
      <div
        className="absolute inset-0 card-holo-shimmer"
        style={{
          background:
            "linear-gradient(135deg, transparent 20%, rgba(220,245,140,0.04) 30%, rgba(100,200,255,0.03) 40%, rgba(255,100,200,0.03) 50%, transparent 60%)",
        }}
      />

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Inner border frame */}
      <div className="absolute inset-5 sm:inset-7 rounded-[12px] border border-white/[0.04]" />

      {/* Centre logo + label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] overflow-hidden bg-black/40 flex items-center justify-center border border-white/[0.06]">
          <img
            src="/limitless-logo.svg"
            alt="Limitless"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
        </div>
        <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.3em] text-[#27272A] uppercase">
          Trader Card
        </span>
      </div>

      {/* Corner filigree — top-left */}
      <div className="absolute top-4 left-4">
        <div className="w-4 h-[1px] bg-white/[0.06]" />
        <div className="w-[1px] h-4 bg-white/[0.06]" />
      </div>

      {/* Corner filigree — bottom-right */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end">
        <div className="w-[1px] h-4 bg-white/[0.06] self-end" />
        <div className="w-4 h-[1px] bg-white/[0.06]" />
      </div>
    </div>
  );
}
