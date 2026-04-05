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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    }

    function init() {
      if (!canvas) return;
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
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
      const { width, height } = canvas;
      const inten = intensityRef.current;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx + (Math.random() - 0.5) * 0.06;
        p.y += p.vy * (0.5 + inten * 0.8);

        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

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
