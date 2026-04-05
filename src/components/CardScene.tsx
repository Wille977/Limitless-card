"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";

interface CardSceneProps {
  flipped: boolean;
  spinning: boolean;
  interactive: boolean;
  floating: boolean;
  children: [ReactNode, ReactNode]; // [back, front]
}

export function CardScene({
  flipped,
  spinning,
  interactive,
  floating,
  children,
}: CardSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  /* ── Pointer tracking for tilt + holo (mouse + touch) ───────────────────── */

  const updateTilt = useCallback(
    (clientX: number, clientY: number) => {
      if (!interactive) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      setTilt({ x: (0.5 - y) * 15, y: (x - 0.5) * 15 });
      setGlare({ x: x * 100, y: y * 100 });
    },
    [interactive]
  );

  const resetTilt = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => updateTilt(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", resetTilt);
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", resetTilt);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", resetTilt);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", resetTilt);
    };
  }, [updateTilt, resetTilt]);

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <motion.div
      animate={floating ? { y: [0, -8, 0] } : { y: 0 }}
      transition={
        floating
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5 }
      }
      className="w-full max-w-[540px] sm:max-w-[620px]"
      style={{ perspective: "1200px" }}
    >
      <div ref={containerRef} className="relative">
        {/* Layer 1 — tilt (pointer-driven in result stage) */}
        <motion.div
          animate={{
            rotateX: interactive ? tilt.x : 0,
            rotateY: interactive ? tilt.y : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Layer 2 — spin (CSS animation during loading) */}
          <div
            className={spinning ? "card-spin" : undefined}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Layer 3 — flip (framer-motion 0→180) */}
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Aspect-ratio container */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "1.65 / 1" }}
              >
                {/* Back face */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {children[0]}
                </div>

                {/* Front face */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {children[1]}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Holographic overlay — only in interactive (result) state */}
        {interactive && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-20">
            {/* Rainbow refraction */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                background: `linear-gradient(${
                  135 + (glare.x - 50) * 2
                }deg, #ff000040, #ff880040, #ffff0040, #00ff0040, #0088ff40, #8800ff40, #ff000040)`,
                mixBlendMode: "color-dodge",
              }}
            />
            {/* Spot glare following cursor */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.12) 0%, transparent 50%)`,
              }}
            />
          </div>
        )}

        {/* Ambient accent glow behind card */}
        {(flipped || spinning) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: spinning ? 0.15 : 0.08 }}
            className="absolute inset-0 -z-10 blur-3xl rounded-full"
            style={{ background: "#DCF58C", transform: "scale(0.8)" }}
          />
        )}
      </div>
    </motion.div>
  );
}
