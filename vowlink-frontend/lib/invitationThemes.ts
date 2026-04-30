import type { CSSProperties } from "react";

export const INVITATION_THEME_IDS = [
  "royal",
  "sage",
  "midnight",
  "blush",
  "ivory",
] as const;

export type InvitationThemeId = (typeof INVITATION_THEME_IDS)[number];

export const DEFAULT_INVITATION_THEME: InvitationThemeId = "royal";

export function normalizeInvitationThemeId(
  raw: string | undefined | null,
): InvitationThemeId {
  if (raw && (INVITATION_THEME_IDS as readonly string[]).includes(raw)) {
    return raw as InvitationThemeId;
  }
  return DEFAULT_INVITATION_THEME;
}

/** Hex colors for each theme (cream, accent gold, primary text brown). */
export const INVITATION_THEME_PALETTES: Record<
  InvitationThemeId,
  { cream: string; gold: string; brown: string }
> = {
  royal: {
    cream: "#f5f5dc",
    gold: "#d4af37",
    brown: "#4b3621",
  },
  sage: {
    cream: "#eef2ec",
    gold: "#4d6b52",
    brown: "#2a382c",
  },
  midnight: {
    cream: "#e8eaf2",
    gold: "#b8922e",
    brown: "#1a2332",
  },
  blush: {
    cream: "#faf5f5",
    gold: "#c9a88a",
    brown: "#5c3d3d",
  },
  ivory: {
    cream: "#faf8f3",
    gold: "#b8860b",
    brown: "#3d3429",
  },
};

/**
 * Overrides `--royal-*` and root app colors so Tailwind `bg-royal-cream` etc.
 * inherit the chosen palette under this subtree.
 */
export function invitationThemeStyle(
  id: InvitationThemeId,
): CSSProperties {
  const p = INVITATION_THEME_PALETTES[id];
  return {
    "--royal-cream": p.cream,
    "--royal-gold": p.gold,
    "--royal-brown": p.brown,
    "--background": p.cream,
    "--foreground": p.brown,
  } as CSSProperties;
}
