"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { text: "Pulling your on-chain data…", duration: 700 },
  { text: "Analysing trade history…", duration: 800 },
  { text: "Cross-referencing market categories…", duration: 900 },
  { text: "Calculating win rate & P&L…", duration: 800 },
  { text: "Measuring position sizing…", duration: 700 },
  { text: "Identifying your archetype…", duration: 900 },
  { text: "Rendering your card…", duration: 600 },
];

const TOTAL = STEPS.reduce((a, s) => a + s.duration, 0);

export function AnalysisLoader({
  wallet,
  onComplete,
}: {
  wallet: string;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    let current = 0;
    let totalElapsed = 0;

    const runStep = () => {
      if (current >= STEPS.length) {
        setProgress(100);
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }, 400);
        return;
      }
      setStepIndex(current);
      const duration = STEPS[current].duration;
      const start = totalElapsed;

      const tick = setInterval(() => {
        const elapsed = start + duration;
        setProgress(Math.min(99, Math.round((elapsed / TOTAL) * 100)));
      }, 50);

      setTimeout(() => {
        clearInterval(tick);
        totalElapsed = STEPS.slice(0, current + 1).reduce((a, s) => a + s.duration, 0);
        setProgress(Math.round((totalElapsed / TOTAL) * 100));
        current++;
        runStep();
      }, duration);
    };

    runStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const short = wallet.slice(0, 6) + "…" + wallet.slice(-4);

  return (
    <div className="flex flex-col items-center justify-center min-h-[340px] w-full max-w-md mx-auto px-4">
      {/* Spinning logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center overflow-hidden"
      >
        <img src="/limitless-logo.svg" alt="Limitless" className="w-full h-full" />
      </motion.div>

      <p className="text-[10px] font-mono tracking-widest mb-5 text-[#52525B] uppercase">
        analysing {short}
      </p>

      {/* Cycling step text */}
      <div className="h-7 mb-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-center text-[#A1A1AA]"
          >
            {STEPS[stepIndex]?.text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-white/[0.06] rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#d7ee88" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <span className="text-[10px] font-mono text-[#3F3F46]">{progress}%</span>
    </div>
  );
}
