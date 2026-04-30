"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const COLORS = ["#d4af37", "#c9a227", "#e8d48a", "#8b6914", "#f5e6a8"];

type Piece = {
  id: number;
  left: string;
  delay: number;
  w: number;
  h: number;
  color: string;
};

export function InvitationConfetti({ burst }: { burst: number }) {
  const reduced = usePrefersReducedMotion();
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (reduced || burst === 0) return;

    const next: Piece[] = [];
    for (let i = 0; i < 52; i += 1) {
      next.push({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        delay: Math.random() * 0.2,
        w: 3 + Math.random() * 7,
        h: 5 + Math.random() * 9,
        color: COLORS[i % COLORS.length],
      });
    }

    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (!cancelled) setPieces(next);
    });
    const clear = window.setTimeout(() => {
      if (!cancelled) setPieces([]);
    }, 3200);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
    };
  }, [burst, reduced]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={`${burst}-${p.id}`}
          className="absolute top-0 rounded-[1px] invitation-confetti-fall"
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
