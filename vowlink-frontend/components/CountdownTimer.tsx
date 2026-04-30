"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

const calculateTimeLeft = (targetDate: string) => {
  const targetTimestamp = new Date(targetDate).getTime();
  const difference = targetTimestamp - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export function CountdownTimer({ weddingDate }: { weddingDate: string }) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(weddingDate));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft(weddingDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [weddingDate]);

  const segments = useMemo(
    () => [
      { label: t("days"), value: timeLeft.days },
      { label: t("hours"), value: timeLeft.hours },
      { label: t("minutes"), value: timeLeft.minutes },
      { label: t("seconds"), value: timeLeft.seconds },
    ],
    [t, timeLeft],
  );

  return (
    <div
      dir="ltr"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
    >
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="rounded-2xl border border-royal-gold/35 bg-white/95 p-3 text-center shadow-sm ring-1 ring-royal-gold/10 sm:p-3.5"
        >
          <div className="text-2xl font-semibold tabular-nums text-royal-brown sm:text-3xl">
            {segment.value}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-royal-gold sm:text-xs sm:tracking-[0.18em]">
            {segment.label}
          </div>
        </div>
      ))}
    </div>
  );
}
