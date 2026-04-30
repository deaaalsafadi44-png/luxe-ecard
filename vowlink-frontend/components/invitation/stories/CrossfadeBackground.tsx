"use client";

import { useEffect, useState } from "react";

const INTERVAL_MS = 6000;

export function CrossfadeBackground({
  urls,
  className = "",
}: {
  urls: string[];
  className?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (urls.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % urls.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [urls.length]);

  if (urls.length === 0) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${url})` }}
        />
      ))}
    </div>
  );
}
