"use client";

import Link from "next/link";
import { BrandInlineLogo } from "@/components/BrandLogo";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="min-h-dvh bg-royal-cream px-4 pb-12 pt-20 text-royal-brown sm:px-6 sm:pt-24 md:px-8">
      <section className="mx-auto max-w-5xl rounded-2xl border border-royal-gold/30 bg-white/70 p-6 shadow-lg backdrop-blur-sm sm:rounded-3xl sm:p-10 md:p-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-royal-gold sm:text-sm">
          {t("royalCollection")}
        </p>
        <BrandInlineLogo className="mb-4" />
        <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
          {t("brandLuxecard")}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed md:text-lg">
          {t("platformDescription")}
        </p>
        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/couple/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-royal-gold px-5 py-2.5 text-center text-sm font-medium text-royal-brown sm:min-h-0"
          >
            {t("openCouplePortal")}
          </Link>
          <Link
            href="/platform/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-royal-brown/30 px-5 py-2.5 text-center text-sm font-medium sm:min-h-0"
          >
            {t("openPlatformPortal")}
          </Link>
        </nav>
      </section>
    </main>
  );
}
