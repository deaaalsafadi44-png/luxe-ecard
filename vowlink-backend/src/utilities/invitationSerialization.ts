import { normalizeInvitationThemeId } from "../constants/invitationTheme";
import type { InvitationExperience } from "../types/InvitationExperience";

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

/** Normalizes Mixed / partial experience from DB into a safe object for JSON. */
export function mergeInvitationExperience(
  raw: unknown,
): InvitationExperience | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const urls = Array.isArray(o.backgroundImageUrls)
    ? (o.backgroundImageUrls as unknown[])
        .filter((u): u is string => typeof u === "string" && u.length > 0)
        .slice(0, 12)
    : [];

  const out: InvitationExperience = {
    backgroundImageUrls: urls,
  };

  const bgVideo = str(o.backgroundVideoUrl);
  if (bgVideo) out.backgroundVideoUrl = bgVideo;

  if (o.backgroundMediaMode === "slideshow" || o.backgroundMediaMode === "video") {
    out.backgroundMediaMode = o.backgroundMediaMode;
  }

  const music = str(o.backgroundMusicUrl);
  if (music) out.backgroundMusicUrl = music;

  const optionalKeys = [
    "openingVerse",
    "openingVerseCitation",
    "togetherLine",
    "parentsLeft",
    "parentsRight",
    "invitationParagraph",
    "hostFamilyLine",
    "countdownTagline",
    "polaroidCaption",
    "galleryInviteMessage",
    "ceremonySlideTitle",
    "giftRegistryTitle",
    "giftRegistryBody",
    "giftRegistryImageUrl",
    "rsvpIntroHeading",
    "rsvpDeadlineText",
    "guestWelcomeMessageTemplate",
    "openingVerseEn",
    "openingVerseCitationEn",
    "togetherLineEn",
    "parentsLeftEn",
    "parentsRightEn",
    "invitationParagraphEn",
    "hostFamilyLineEn",
    "countdownTaglineEn",
    "polaroidCaptionEn",
    "galleryInviteMessageEn",
    "ceremonySlideTitleEn",
    "giftRegistryTitleEn",
    "giftRegistryBodyEn",
    "rsvpIntroHeadingEn",
    "rsvpDeadlineTextEn",
    "guestWelcomeMessageTemplateEn",
  ] as const;

  for (const key of optionalKeys) {
    const s = str(o[key]);
    if (s !== undefined) out[key] = s;
  }

  if (typeof o.showGiftSlide === "boolean") {
    out.showGiftSlide = o.showGiftSlide;
  }

  const sl = o.slideLayouts;
  if (sl && typeof sl === "object" && !Array.isArray(sl)) {
    out.slideLayouts = sl as InvitationExperience["slideLayouts"];
  }

  return out;
}

/** Ensures API payloads always include a valid theme and presentation fields. */
export function withInvitationThemeDefault<T extends { invitationTheme?: string | null }>(
  invitation: T,
): T & {
  invitationTheme: ReturnType<typeof normalizeInvitationThemeId>;
  presentationMode: "classic" | "stories";
  invitationExperience?: InvitationExperience;
} {
  const presentationMode =
    (invitation as { presentationMode?: string | null }).presentationMode ===
    "stories"
      ? "stories"
      : "classic";
  const experience = mergeInvitationExperience(
    (invitation as { invitationExperience?: unknown }).invitationExperience,
  );
  return {
    ...invitation,
    invitationTheme: normalizeInvitationThemeId(invitation.invitationTheme ?? undefined),
    presentationMode,
    ...(experience ? { invitationExperience: experience } : {}),
  };
}
