"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
}

export function ParticleField({ intensity = 0.3 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let rafId: number;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx?.scale(dpr, dpr);
      init();
    }

    function init() {
      if (!canvas) return;
      const logicalW = window.innerWidth;
      const logicalH = window.innerHeight;
      const count = Math.min(600, Math.floor((logicalW * logicalH) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * logicalW,
        y: Math.random() * logicalH,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.15 - 0.03,
        size: Math.random() * 2 + 0.4,
        baseOpacity: Math.random() * 0.035 + 0.008,
        opacity: 0,
      }));
    }

    function draw() {
      rafId = requestAnimationFrame(draw);
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const inten = intensityRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx + (Math.random() - 0.5) * 0.06;
        p.y += p.vy * (0.5 + inten * 0.8);

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const target = p.baseOpacity * (0.6 + inten * 1.8);
        p.opacity += (target - p.opacity) * 0.025;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + inten * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 245, 140, ${p.opacity})`;
        ctx.fill();
      }
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
