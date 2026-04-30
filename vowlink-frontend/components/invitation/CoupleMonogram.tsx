function initialsFromCoupleNames(names: string): string {
  const trimmed = names.trim();
  if (!trimmed) return "";

  const separators = /(?:\s*[&,،]+\s*|\s+و\s+|\s+and\s+)/i;
  const parts = trimmed.split(separators).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const a = parts[0].charAt(0);
    const b = parts[parts.length - 1].charAt(0);
    return `${a}${b}`.toUpperCase();
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

function hasArabicScript(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

export function CoupleMonogram({
  coupleNames,
  className = "",
}: {
  coupleNames: string;
  className?: string;
}) {
  const isArabic = hasArabicScript(coupleNames);
  const letters = initialsFromCoupleNames(coupleNames);
  if (!letters && !isArabic) return null;

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-royal-gold/40 bg-gradient-to-br from-white/90 to-royal-cream/80 text-lg font-semibold tracking-tight text-royal-brown shadow-sm ring-1 ring-royal-gold/20 sm:h-16 sm:w-16 sm:text-xl ${className}`}
      aria-hidden
    >
      {isArabic ? (
        <div className="relative h-7 w-7 sm:h-8 sm:w-8">
          <span className="absolute start-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border border-royal-gold/70 sm:h-5 sm:w-5" />
          <span className="absolute end-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border border-royal-gold/70 sm:h-5 sm:w-5" />
          <span className="absolute start-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-gold/75" />
        </div>
      ) : (
        letters
      )}
    </div>
  );
}
