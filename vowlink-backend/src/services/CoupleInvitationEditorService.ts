import mongoose from "mongoose";
import { z } from "zod";
import { InvitationModel } from "../models/Invitation";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { withInvitationThemeDefault } from "../utilities/invitationSerialization";

/** Accepts any http(s) URL (UploadThing, CDNs, etc.); Zod’s .url() is stricter than `new URL()`. */
const httpUrlOrEmpty = z.union([
  z.literal(""),
  z.string().refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Invalid URL"),
]);

const optionalLongText = z.string().max(8000).optional();

const slideLayoutSchema = z
  .object({
    textAlign: z.enum(["center", "start", "end"]).optional(),
    verticalAlign: z.enum(["start", "center", "end"]).optional(),
    headingColor: z.string().max(32).optional(),
    bodyColor: z.string().max(32).optional(),
    headingFont: z
      .enum([
        "display",
        "serif",
        "sans",
        "cairo",
        "amiri",
        "playfair",
        "cinzel",
        "poppins",
      ])
      .optional(),
    bodyFont: z
      .enum([
        "display",
        "serif",
        "sans",
        "cairo",
        "amiri",
        "playfair",
        "cinzel",
        "poppins",
      ])
      .optional(),
    headingSizePx: z.coerce.number().int().min(10).max(120).optional(),
    bodySizePx: z.coerce.number().int().min(10).max(60).optional(),
    /** Legacy support (old clients). */
    headingSize: z.enum(["sm", "md", "lg", "xl"]).optional(),
    bodySize: z.enum(["sm", "md", "lg", "xl"]).optional(),
  })
  .strict();

const slideLayoutsSchema = z
  .object({
    opening: slideLayoutSchema.optional(),
    countdown: slideLayoutSchema.optional(),
    ceremony: slideLayoutSchema.optional(),
    polaroid: slideLayoutSchema.optional(),
    rsvp: slideLayoutSchema.optional(),
    gift: slideLayoutSchema.optional(),
  })
  .strict()
  .optional();

export const invitationExperienceSchema = z
  .object({
    backgroundImageUrls: z.array(z.string().url()).max(12).default([]),
    backgroundVideoUrl: httpUrlOrEmpty.optional(),
    backgroundMediaMode: z.enum(["slideshow", "video"]).optional(),
    backgroundMusicUrl: httpUrlOrEmpty.optional(),
    openingVerse: optionalLongText,
    openingVerseCitation: optionalLongText,
    togetherLine: optionalLongText,
    parentsLeft: optionalLongText,
    parentsRight: optionalLongText,
    invitationParagraph: optionalLongText,
    hostFamilyLine: optionalLongText,
    countdownTagline: optionalLongText,
    polaroidCaption: optionalLongText,
    galleryInviteMessage: optionalLongText,
    ceremonySlideTitle: optionalLongText,
    giftRegistryTitle: optionalLongText,
    giftRegistryBody: optionalLongText,
    giftRegistryImageUrl: httpUrlOrEmpty.optional(),
    showGiftSlide: z.boolean().optional(),
    rsvpIntroHeading: optionalLongText,
    rsvpDeadlineText: optionalLongText,
    guestWelcomeMessageTemplate: optionalLongText,
    openingVerseEn: optionalLongText,
    openingVerseCitationEn: optionalLongText,
    togetherLineEn: optionalLongText,
    parentsLeftEn: optionalLongText,
    parentsRightEn: optionalLongText,
    invitationParagraphEn: optionalLongText,
    hostFamilyLineEn: optionalLongText,
    countdownTaglineEn: optionalLongText,
    polaroidCaptionEn: optionalLongText,
    galleryInviteMessageEn: optionalLongText,
    ceremonySlideTitleEn: optionalLongText,
    giftRegistryTitleEn: optionalLongText,
    giftRegistryBodyEn: optionalLongText,
    rsvpIntroHeadingEn: optionalLongText,
    rsvpDeadlineTextEn: optionalLongText,
    guestWelcomeMessageTemplateEn: optionalLongText,
    slideLayouts: slideLayoutsSchema,
  })
  .strict();

const couplePatchSchema = z.object({
  coupleNames: z.string().trim().min(2).optional(),
  coupleNamesEn: z.string().trim().min(2).optional(),
  weddingDate: z.string().trim().min(1).optional(),
  venueName: z.string().trim().min(2).optional(),
  venueNameEn: z.string().trim().min(2).optional(),
  venueAddress: z.string().trim().min(3).optional(),
  venueAddressEn: z.string().trim().min(3).optional(),
  mapEmbedUrl: z.string().url().optional(),
  coverPhotoUrl: httpUrlOrEmpty.optional(),
  galleryPhotoUrls: z.array(z.string().url()).optional(),
  invitationTheme: z
    .enum(["royal", "sage", "midnight", "blush", "ivory"])
    .optional(),
  presentationMode: z.enum(["classic", "stories"]).optional(),
  invitationExperience: invitationExperienceSchema.optional(),
});

export const coupleInvitationEditorService = {
  async getInvitationForEditor(invitationId: string) {
    if (mongoose.connection.readyState !== 1) {
      const mem = inMemoryInvitationStore.getInvitationById(invitationId);
      return mem ? withInvitationThemeDefault(mem) : null;
    }

    const doc = await InvitationModel.findById(invitationId).lean();
    return doc ? withInvitationThemeDefault(doc) : null;
  },

  async updateInvitationForCouple(
    invitationId: string,
    rawBody: unknown,
  ) {
    const payload = couplePatchSchema.parse(rawBody);

    if (mongoose.connection.readyState !== 1) {
      const inv = inMemoryInvitationStore.getInvitationById(invitationId);
      if (!inv) {
        return null;
      }
      const patch: Record<string, unknown> = { ...payload };
      if (payload.weddingDate) {
        patch.weddingDate = new Date(payload.weddingDate);
      }
      if (payload.coverPhotoUrl === "") {
        delete patch.coverPhotoUrl;
      }
      if (payload.invitationExperience) {
        const exp = { ...payload.invitationExperience };
        if (exp.backgroundMusicUrl === "") {
          delete exp.backgroundMusicUrl;
        }
        patch.invitationExperience = exp;
      }
      const merged = { ...inv, ...patch } as typeof inv;
      if (payload.coverPhotoUrl === "") {
        delete merged.coverPhotoUrl;
      }
      const next = inMemoryInvitationStore.updateInvitationBySlug(
        inv.slug,
        merged,
      );
      return next ? withInvitationThemeDefault(next) : null;
    }

    const update: Record<string, unknown> = {};
    const unsetFields: Record<string, 1> = {};
    if (payload.coupleNames !== undefined) update.coupleNames = payload.coupleNames;
    if (payload.coupleNamesEn !== undefined) update.coupleNamesEn = payload.coupleNamesEn;
    if (payload.weddingDate !== undefined) {
      update.weddingDate = new Date(payload.weddingDate);
    }
    if (payload.venueName !== undefined) update.venueName = payload.venueName;
    if (payload.venueNameEn !== undefined) update.venueNameEn = payload.venueNameEn;
    if (payload.venueAddress !== undefined) {
      update.venueAddress = payload.venueAddress;
    }
    if (payload.venueAddressEn !== undefined) {
      update.venueAddressEn = payload.venueAddressEn;
    }
    if (payload.mapEmbedUrl !== undefined) update.mapEmbedUrl = payload.mapEmbedUrl;
    if (payload.coverPhotoUrl !== undefined) {
      if (payload.coverPhotoUrl === "") {
        unsetFields.coverPhotoUrl = 1;
      } else {
        update.coverPhotoUrl = payload.coverPhotoUrl;
      }
    }
    if (payload.galleryPhotoUrls !== undefined) {
      update.galleryPhotoUrls = payload.galleryPhotoUrls;
    }
    if (payload.invitationTheme !== undefined) {
      update.invitationTheme = payload.invitationTheme;
    }
    if (payload.presentationMode !== undefined) {
      update.presentationMode = payload.presentationMode;
    }
    if (payload.invitationExperience !== undefined) {
      const exp = { ...payload.invitationExperience };
      if (exp.backgroundMusicUrl === "") {
        delete exp.backgroundMusicUrl;
      }
      update.invitationExperience = exp;
    }

    const mongoOps: Record<string, unknown> = {};
    if (Object.keys(update).length > 0) {
      mongoOps.$set = update;
    }
    if (Object.keys(unsetFields).length > 0) {
      mongoOps.$unset = unsetFields;
    }

    if (Object.keys(mongoOps).length === 0) {
      const unchanged = await InvitationModel.findById(invitationId).lean();
      return unchanged ? withInvitationThemeDefault(unchanged) : null;
    }

    const updated = await InvitationModel.findByIdAndUpdate(
      invitationId,
      mongoOps,
      { new: true },
    ).lean();
    return updated ? withInvitationThemeDefault(updated) : null;
  },
};
