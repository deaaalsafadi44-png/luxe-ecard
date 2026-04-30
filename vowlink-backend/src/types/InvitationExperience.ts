export type StoriesSlideId =
  | "opening"
  | "countdown"
  | "ceremony"
  | "polaroid"
  | "rsvp"
  | "gift";

export interface StoriesSlideLayoutSettings {
  textAlign?: "center" | "start" | "end";
  verticalAlign?: "start" | "center" | "end";
  headingColor?: string;
  bodyColor?: string;
  headingFont?:
    | "display"
    | "serif"
    | "sans"
    | "cairo"
    | "amiri"
    | "playfair"
    | "cinzel"
    | "poppins";
  bodyFont?:
    | "display"
    | "serif"
    | "sans"
    | "cairo"
    | "amiri"
    | "playfair"
    | "cinzel"
    | "poppins";
  /** Exact sizes in px (preferred). */
  headingSizePx?: number;
  bodySizePx?: number;
  /** Legacy sizes (backward compatibility). */
  headingSize?: "sm" | "md" | "lg" | "xl";
  bodySize?: "sm" | "md" | "lg" | "xl";
}

/**
 * Editable “stories” invitation content (stored on Invitation, patched from couple dashboard).
 */
export interface InvitationExperience {
  /** Full-bleed slideshow behind slides; if empty, coverPhotoUrl is used when set. */
  backgroundImageUrls: string[];
  /** Optional background video URL. When set, it replaces the image slideshow. */
  backgroundVideoUrl?: string;
  /** Distinguishes slideshow vs video before a video file is uploaded (fixes radio UX). */
  backgroundMediaMode?: "slideshow" | "video";
  /** MP3 or compatible audio URL (UploadThing or external HTTPS). */
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
  guestWelcomeMessageTemplate?: string;
  /** Optional English variants; used when UI language is English. */
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
  guestWelcomeMessageTemplateEn?: string;
  slideLayouts?: Partial<Record<StoriesSlideId, StoriesSlideLayoutSettings>>;
}

export type PresentationMode = "classic" | "stories";
