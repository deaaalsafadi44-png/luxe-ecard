import type { InvitationThemeId } from "./invitationThemes";

import type { StoriesSlideId, StoriesSlideLayoutSettings } from "./storiesSlideLayout";

export type { StoriesSlideId, StoriesSlideLayoutSettings } from "./storiesSlideLayout";

export type PresentationMode = "classic" | "stories";

export type BackgroundMediaMode = "slideshow" | "video";

export interface InvitationExperience {
  backgroundImageUrls: string[];
  backgroundVideoUrl?: string;
  /** When set to `video`, the video option stays selected even before a file is uploaded. */
  backgroundMediaMode?: BackgroundMediaMode;
  backgroundMusicUrl?: string;
  openingVerse?: string;
  openingVerseCitation?: string;
  togetherLine?: string;
  parentsLeft?: string;
  parentsRight?: string;
  invitationParagraph?: string;
  hostFamilyLine?: string;
  countdownTagline?: string;
  polaroidCaption?: string;
  galleryInviteMessage?: string;
  ceremonySlideTitle?: string;
  giftRegistryTitle?: string;
  giftRegistryBody?: string;
  giftRegistryImageUrl?: string;
  showGiftSlide?: boolean;
  rsvpIntroHeading?: string;
  rsvpDeadlineText?: string;
  /** Greeting phrase only; the guest name is appended automatically when they open their link. */
  guestWelcomeMessageTemplate?: string;
  guestWelcomeMessageTemplateEn?: string;
  openingVerseEn?: string;
  openingVerseCitationEn?: string;
  togetherLineEn?: string;
  parentsLeftEn?: string;
  parentsRightEn?: string;
  invitationParagraphEn?: string;
  hostFamilyLineEn?: string;
  countdownTaglineEn?: string;
  polaroidCaptionEn?: string;
  galleryInviteMessageEn?: string;
  ceremonySlideTitleEn?: string;
  giftRegistryTitleEn?: string;
  giftRegistryBodyEn?: string;
  rsvpIntroHeadingEn?: string;
  rsvpDeadlineTextEn?: string;
  /** Per-slide typography and alignment (stories mode). */
  slideLayouts?: Partial<Record<StoriesSlideId, StoriesSlideLayoutSettings>>;
}

export function emptyInvitationExperience(): InvitationExperience {
  return {
    backgroundImageUrls: [],
    showGiftSlide: false,
  };
}

export function mergeInvitationExperience(
  raw?: Partial<InvitationExperience> | null,
): InvitationExperience {
  const e = emptyInvitationExperience();
  if (!raw) return e;
  const slideLayouts =
    raw.slideLayouts && typeof raw.slideLayouts === "object"
      ? (raw.slideLayouts as InvitationExperience["slideLayouts"])
      : undefined;

  const mode: BackgroundMediaMode | undefined =
    raw.backgroundMediaMode === "video" || raw.backgroundMediaMode === "slideshow"
      ? raw.backgroundMediaMode
      : undefined;

  return {
    ...e,
    ...raw,
    backgroundImageUrls: Array.isArray(raw.backgroundImageUrls)
      ? raw.backgroundImageUrls.filter(Boolean).slice(0, 12)
      : [],
    backgroundVideoUrl:
      typeof raw.backgroundVideoUrl === "string" && raw.backgroundVideoUrl.trim()
        ? raw.backgroundVideoUrl.trim()
        : undefined,
    backgroundMediaMode: mode,
    showGiftSlide: Boolean(raw.showGiftSlide),
    ...(slideLayouts ? { slideLayouts } : {}),
  };
}

/** True when a background video should be shown (not the image slideshow). */
export function shouldShowVideoBackground(experience: InvitationExperience): boolean {
  const url = experience.backgroundVideoUrl?.trim();
  if (!url) return false;
  if (experience.backgroundMediaMode === "slideshow") return false;
  return true;
}

/** Resolved URLs for crossfade: dashboard images, else cover photo. */
export function resolveBackgroundImageUrls(
  experience: InvitationExperience,
  coverPhotoUrl?: string,
): string[] {
  if (shouldShowVideoBackground(experience)) return [];
  const fromExp = experience.backgroundImageUrls?.filter(Boolean) ?? [];
  if (fromExp.length > 0) return fromExp;
  const c = coverPhotoUrl?.trim();
  return c ? [c] : [];
}

/**
 * Renders the guest line: optional phrase, then a space, then the guest's name.
 * If the template is empty, uses `defaultWelcomePhrase` (e.g. "أهلاً") + name.
 * Legacy templates may still use `{guestName}`; that placeholder is replaced.
 */
export function resolveGuestWelcomeMessage(
  template: string | undefined,
  guestName: string,
  defaultWelcomePhrase?: string,
): string {
  const raw = template?.trim();
  if (!raw) {
    const def = defaultWelcomePhrase?.trim();
    if (def) return `${def} ${guestName}`.trim();
    return guestName;
  }
  if (raw.includes("{guestName}")) {
    return raw.replaceAll("{guestName}", guestName).trim();
  }
  return `${raw} ${guestName}`.trim();
}

export type InvitationPayloadForView = {
  coupleNames: string;
  slug: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  mapEmbedUrl: string;
  coverPhotoUrl?: string;
  galleryPhotoUrls: string[];
  invitationTheme?: InvitationThemeId;
  presentationMode?: PresentationMode;
  invitationExperience?: InvitationExperience;
};
