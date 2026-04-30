"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function InvitationShareButton({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copyLink()}
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-xl border border-royal-gold/35 bg-white/80 px-4 py-2 text-sm font-medium text-royal-brown shadow-sm backdrop-blur-sm transition hover:border-royal-gold/55 hover:bg-white active:scale-[0.98] ${className}`}
    >
      <svg className="h-4 w-4 text-royal-gold" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 13a5 5 0 0 1 7.54.54l2 2a5 5 0 1 1-7.07 7.07l-1.72-1.71"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 0 1-7.54-.54l-2-2a5 5 0 1 1 7.07-7.07l1.71 1.71"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {copied ? t("linkCopiedShare") : t("shareInvitation")}
    </button>
  );
}
