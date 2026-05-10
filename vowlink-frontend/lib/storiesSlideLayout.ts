import type { CSSProperties } from "react";

export type StoriesSlideId =
  | "opening"
  | "countdown"
  | "ceremony"
  | "polaroid"
  | "rsvp"
  | "gift";

export type StoriesTextAlign = "center" | "start" | "end";
export type StoriesVerticalAlign = "start" | "center" | "end";
export type StoriesFontPreset =
  | "display"
  | "serif"
  | "sans"
  | "cairo"
  | "amiri"
  | "playfair"
  | "cinzel"
  | "poppins"
  | "greatvibes"
  | "lora"
  | "montserrat"
  | "merriweather"
  | "elmessiri";
export type StoriesTextSize = "sm" | "md" | "lg" | "xl";

export interface StoriesSlideLayoutSettings {
  textAlign?: StoriesTextAlign;
  verticalAlign?: StoriesVerticalAlign;
  /** Hex color e.g. #ffffff */
  headingColor?: string;
  bodyColor?: string;
  headingFont?: StoriesFontPreset;
  bodyFont?: StoriesFontPreset;
  /**
   * Preferred sizing in px (exact). When set, it takes precedence over
   * the legacy enum sizes.
   */
  headingSizePx?: number;
  bodySizePx?: number;
  /** Legacy sizes (kept for backward compatibility). */
  headingSize?: StoriesTextSize;
  bodySize?: StoriesTextSize;
}

const DEFAULTS: Record<StoriesSlideId, StoriesSlideLayoutSettings> = {
  opening: {
    textAlign: "center",
    verticalAlign: "start",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 40,
    bodySizePx: 16,
  },
  countdown: {
    textAlign: "center",
    verticalAlign: "center",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 38,
    bodySizePx: 16,
  },
  ceremony: {
    textAlign: "center",
    verticalAlign: "start",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 36,
    bodySizePx: 16,
  },
  polaroid: {
    textAlign: "center",
    verticalAlign: "start",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 34,
    bodySizePx: 16,
  },
  rsvp: {
    textAlign: "center",
    verticalAlign: "start",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 34,
    bodySizePx: 16,
  },
  gift: {
    textAlign: "center",
    verticalAlign: "start",
    headingFont: "display",
    bodyFont: "sans",
    headingSizePx: 34,
    bodySizePx: 16,
  },
};

export function mergeSlideLayout(
  slideId: StoriesSlideId,
  slideLayouts?: Partial<Record<StoriesSlideId, StoriesSlideLayoutSettings>>,
): StoriesSlideLayoutSettings {
  const partial = slideLayouts?.[slideId];
  return { ...DEFAULTS[slideId], ...partial };
}

export function headingFontClass(preset?: StoriesFontPreset): string {
  switch (preset ?? "display") {
    case "cairo":
      return "[font-family:var(--font-invitation-display),var(--font-geist-sans),sans-serif]";
    case "amiri":
      return "[font-family:var(--font-invitation-amiri),serif]";
    case "playfair":
      return "[font-family:var(--font-invitation-playfair),serif]";
    case "cinzel":
      return "[font-family:var(--font-invitation-cinzel),serif]";
    case "poppins":
      return "[font-family:var(--font-invitation-poppins),var(--font-geist-sans),sans-serif]";
    case "greatvibes":
      return "[font-family:var(--font-invitation-greatvibes),cursive,serif]";
    case "lora":
      return "[font-family:var(--font-invitation-lora),serif]";
    case "montserrat":
      return "[font-family:var(--font-invitation-montserrat),var(--font-geist-sans),sans-serif]";
    case "merriweather":
      return "[font-family:var(--font-invitation-merriweather),serif]";
    case "elmessiri":
      return "[font-family:var(--font-invitation-elmessiri),var(--font-geist-sans),sans-serif]";
    case "serif":
      return "font-serif";
    case "sans":
      return "font-sans";
    default:
      return "[font-family:var(--font-invitation-display),cursive,sans-serif]";
  }
}

export function bodyFontClass(preset?: StoriesFontPreset): string {
  switch (preset ?? "sans") {
    case "cairo":
      return "[font-family:var(--font-invitation-display),var(--font-geist-sans),sans-serif]";
    case "amiri":
      return "[font-family:var(--font-invitation-amiri),serif]";
    case "playfair":
      return "[font-family:var(--font-invitation-playfair),serif]";
    case "cinzel":
      return "[font-family:var(--font-invitation-cinzel),serif]";
    case "poppins":
      return "[font-family:var(--font-invitation-poppins),var(--font-geist-sans),sans-serif]";
    case "greatvibes":
      return "[font-family:var(--font-invitation-greatvibes),cursive,serif]";
    case "lora":
      return "[font-family:var(--font-invitation-lora),serif]";
    case "montserrat":
      return "[font-family:var(--font-invitation-montserrat),var(--font-geist-sans),sans-serif]";
    case "merriweather":
      return "[font-family:var(--font-invitation-merriweather),serif]";
    case "elmessiri":
      return "[font-family:var(--font-invitation-elmessiri),var(--font-geist-sans),sans-serif]";
    case "display":
      return "[font-family:var(--font-invitation-display),cursive,sans-serif]";
    case "serif":
      return "font-serif";
    default:
      return "font-sans";
  }
}

const legacyHeadingPx = (size?: StoriesTextSize): number => {
  switch (size ?? "md") {
    case "sm":
      return 30;
    case "lg":
      return 48;
    case "xl":
      return 56;
    default:
      return 40;
  }
};

const legacyBodyPx = (size?: StoriesTextSize): number => {
  switch (size ?? "md") {
    case "sm":
      return 13;
    case "lg":
      return 18;
    case "xl":
      return 20;
    default:
      return 16;
  }
};

export function headingSizePx(layout: StoriesSlideLayoutSettings): number {
  const px = layout.headingSizePx;
  if (typeof px === "number" && Number.isFinite(px) && px > 0) return px;
  return legacyHeadingPx(layout.headingSize);
}

export function bodySizePx(layout: StoriesSlideLayoutSettings): number {
  const px = layout.bodySizePx;
  if (typeof px === "number" && Number.isFinite(px) && px > 0) return px;
  return legacyBodyPx(layout.bodySize);
}

/** Outer flex column for slide main content (inside SwiperSlide padding). */
export function storiesSlideOuterClass(layout: StoriesSlideLayoutSettings): string {
  const v = layout.verticalAlign ?? "start";
  const t = layout.textAlign ?? "center";
  const justify =
    v === "center" ? "justify-center" : v === "end" ? "justify-end" : "justify-start";
  const items =
    t === "start"
      ? "items-start text-start"
      : t === "end"
        ? "items-end text-end"
        : "items-center text-center";
  return `flex min-h-0 w-full flex-1 flex-col ${justify} ${items}`;
}

export function storyHeadingStyle(color?: string): CSSProperties {
  const c = color?.trim();
  return c ? { color: c } : {};
}

export function storyBodyStyle(color?: string): CSSProperties {
  const c = color?.trim();
  return c ? { color: c } : {};
}
