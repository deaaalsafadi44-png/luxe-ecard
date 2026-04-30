"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function BrandInlineLogo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/" aria-label={t("brandLuxecard")} className={`inline-flex ${className}`}>
      <Image
        src="/luxecard-logo.png"
        alt={t("brandLuxecard")}
        width={168}
        height={48}
        priority
        className="h-8 w-auto sm:h-10"
      />
    </Link>
  );
}

export function BrandCornerLogo() {
  return (
    <div className="fixed start-4 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-50">
      <BrandInlineLogo />
    </div>
  );
}
