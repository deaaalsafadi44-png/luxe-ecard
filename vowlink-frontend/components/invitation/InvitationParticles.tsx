"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Particle = { id: number; left: string; top: string; size: number; delay: number; duration: number };

export function InvitationParticles() {
  const reduced = usePrefersReducedMotion();

  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 28; i += 1) {
      list.push({
        id: i,
        left: `${4 + (i * 17) % 88}%`,
        top: `${(i * 23) % 92}%`,
        size: 1 + (i % 3),
        delay: (i * 0.35) % 4,
        duration: 3 + (i % 4) * 0.8,
      });
    }
    return list;
  }, []);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="invitation-particle absolute rounded-full bg-royal-gold/35 shadow-[0_0_6px_rgba(212,175,55,0.35)]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
