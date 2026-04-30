"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function InvitationGalleryLightbox({
  urls,
  index,
  onClose,
  onNavigate,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [enter, setEnter] = useState(false);
  const last = urls.length - 1;
  const safe = last < 0 ? 0 : Math.min(Math.max(0, index), last);
  const url = urls[safe];
  const hasMany = urls.length > 1;

  useEffect(() => {
    const id = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (!hasMany) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate(safe >= last ? 0 : safe + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate(safe <= 0 ? last : safe - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMany, last, onClose, onNavigate, safe]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!url) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/82 p-3 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:p-6 ${
        enter ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t("galleryPhotos")}
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-full max-w-full flex-col items-center transition-transform duration-200 ease-out motion-reduce:transition-none ${
          enter ? "scale-100" : "scale-[0.97]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute end-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-royal-brown/90 text-xl text-royal-cream shadow-lg transition hover:bg-royal-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold"
          onClick={onClose}
          aria-label={t("rsvpClosePanel")}
        >
          ×
        </button>

        {hasMany ? (
          <>
            <button
              type="button"
              className="absolute start-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-royal-brown/85 text-royal-cream shadow-md transition hover:bg-royal-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold sm:start-2 sm:h-12 sm:w-12"
              onClick={() => onNavigate(safe <= 0 ? last : safe - 1)}
              aria-label={t("galleryPrev")}
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute end-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-royal-brown/85 text-royal-cream shadow-md transition hover:bg-royal-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold sm:end-2 sm:h-12 sm:w-12"
              onClick={() => onNavigate(safe >= last ? 0 : safe + 1)}
              aria-label={t("galleryNext")}
            >
              ›
            </button>
          </>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element -- full-size gallery URL from invitation */}
        <img
          src={url}
          alt=""
          className="max-h-[min(88vh,900px)] max-w-[min(96vw,1200px)] rounded-xl object-contain shadow-2xl ring-1 ring-white/15"
        />

        {hasMany ? (
          <p className="mt-3 text-center text-xs text-white/80">
            {safe + 1} / {urls.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}
