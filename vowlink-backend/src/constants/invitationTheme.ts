/** Stored on each invitation; drives public page palette via CSS variables on the frontend. */
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
  if (
    raw &&
    (INVITATION_THEME_IDS as readonly string[]).includes(raw)
  ) {
    return raw as InvitationThemeId;
  }
  return DEFAULT_INVITATION_THEME;
}
