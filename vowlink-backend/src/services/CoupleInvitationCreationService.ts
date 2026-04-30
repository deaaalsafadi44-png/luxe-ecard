import mongoose from "mongoose";
import { z } from "zod";
import { InvitationModel } from "../models/Invitation";
import { GuestModel } from "../models/Guest";
import { UserModel } from "../models/User";
import { guestSlugFormatter } from "../utilities/GuestSlugFormatter";
import { signAccessToken } from "../config/authTokens";
import { normalizeInvitationThemeId } from "../constants/invitationTheme";
import { withInvitationThemeDefault } from "../utilities/invitationSerialization";
import { invitationExperienceSchema } from "./CoupleInvitationEditorService";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { inMemoryUserStore } from "../utilities/InMemoryUserStore";

const optionalUrlField = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
}, z.string().url().optional());

const mapEmbedUrlField = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}, z.string().url());

const coupleCreateInvitationSchema = z.object({
  coupleNames: z.string().trim().min(2),
  coupleNamesEn: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(2),
  weddingDate: z.string().trim().min(1),
  venueName: z.string().trim().min(2),
  venueNameEn: z.string().trim().min(2).optional(),
  venueAddress: z.string().trim().min(3),
  venueAddressEn: z.string().trim().min(3).optional(),
  mapEmbedUrl: mapEmbedUrlField,
  coverPhotoUrl: optionalUrlField,
  galleryPhotoUrls: z.array(z.string().url()).optional(),
  invitationTheme: z
    .enum(["royal", "sage", "midnight", "blush", "ivory"])
    .optional(),
  presentationMode: z.enum(["classic", "stories"]).optional(),
  invitationExperience: invitationExperienceSchema.optional(),
  guests: z
    .array(
      z.object({
        guestName: z.string().trim().min(1),
        guestSlug: z.string().trim().min(1).optional(),
      }),
    )
    .optional()
    .default([]),
});

const formatCoupleCreateValidation = (error: z.ZodError): string => {
  const issue = error.issues[0];
  if (!issue) {
    return "Invalid invitation data.";
  }
  const field = issue.path[0];
  const fieldKey = typeof field === "string" ? field : String(field);

  const tooShort =
    issue.code === "too_small" &&
    typeof issue.minimum === "number";

  const hints: Record<string, string> = {
    coupleNames:
      "أسماء العروسين: يجب حرفان على الأقل. / Couple names: at least 2 characters.",
    slug:
      "الرابط المختصر (slug): حرفان على الأقل، بالإنجليزية مفضّل. / Slug: at least 2 characters.",
    weddingDate: "تاريخ الزفاف مطلوب. / Wedding date is required.",
    venueName:
      "اسم القاعة أو المكان: حرفان على الأقل. / Venue name: at least 2 characters.",
    venueAddress:
      "عنوان المكان الكامل (المدينة، الشارع، المبنى): 3 أحرف على الأقل — لا يكفي رقم قصير فقط. / Full address: at least 3 characters (not just a short number).",
    mapEmbedUrl:
      "رابط تضمين خرائط Google يجب أن يبدأ بـ http:// أو https:// / Maps embed must be a valid URL.",
    guests: "تأكد من أسماء الضيوف. / Check guest names.",
  };

  if (tooShort && hints[fieldKey]) {
    return hints[fieldKey];
  }

  if (hints[fieldKey]) {
    return hints[fieldKey];
  }

  return `${fieldKey}: ${issue.message}`;
};

export const coupleInvitationCreationService = {
  async createForCoupleUser(userId: string, rawBody: unknown) {
    if (mongoose.connection.readyState !== 1) {
      const memoryUser = inMemoryUserStore.findById(userId);
      if (!memoryUser || memoryUser.role !== "COUPLE") {
        throw new Error("Invalid account.");
      }
      if (!memoryUser.canCreateInvitation) {
        throw new Error("You are not allowed to create an invitation.");
      }
      if (memoryUser.invitationId) {
        throw new Error("You already have an invitation.");
      }

      const parsed = coupleCreateInvitationSchema.safeParse(rawBody);
      if (!parsed.success) {
        throw new Error(formatCoupleCreateValidation(parsed.error));
      }

      const payload = parsed.data;
      const normalizedSlug = payload.slug.toLowerCase().trim();

      const slugTaken = inMemoryInvitationStore.getInvitationBySlug(normalizedSlug);
      if (slugTaken) {
        throw new Error("This URL slug is already taken. Choose another.");
      }

      const normalizedGuests = (payload.guests ?? []).map((guestRecord) => ({
        guestName: guestRecord.guestName,
        guestSlug: guestSlugFormatter.normalize(
          guestRecord.guestSlug ?? guestRecord.guestName,
        ),
        attendanceStatus: "PENDING" as const,
        companionsCount: 0,
      }));

      const invitation = inMemoryInvitationStore.createInvitation({
        coupleNames: payload.coupleNames,
        ...(payload.coupleNamesEn ? { coupleNamesEn: payload.coupleNamesEn } : {}),
        slug: normalizedSlug,
        weddingDate: new Date(payload.weddingDate),
        venueName: payload.venueName,
        ...(payload.venueNameEn ? { venueNameEn: payload.venueNameEn } : {}),
        venueAddress: payload.venueAddress,
        ...(payload.venueAddressEn ? { venueAddressEn: payload.venueAddressEn } : {}),
        mapEmbedUrl: payload.mapEmbedUrl,
        coverPhotoUrl: payload.coverPhotoUrl,
        galleryPhotoUrls: payload.galleryPhotoUrls ?? [],
        invitationTheme: normalizeInvitationThemeId(payload.invitationTheme),
        presentationMode: payload.presentationMode ?? "stories",
        invitationExperience: payload.invitationExperience,
        status: "DRAFT",
      });

      if (normalizedGuests.length > 0) {
        inMemoryInvitationStore.addGuests(invitation._id, normalizedGuests);
      }

      inMemoryUserStore.updateUser(userId, {
        invitationId: invitation._id,
        canCreateInvitation: false,
      });

      const token = signAccessToken({
        sub: memoryUser._id,
        role: "COUPLE",
        invitationId: invitation._id,
      });

      return {
        token,
        invitation: withInvitationThemeDefault(invitation),
        user: { id: memoryUser._id, email: memoryUser.email },
      };
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "COUPLE") {
      throw new Error("Invalid account.");
    }
    if (!user.canCreateInvitation) {
      throw new Error("You are not allowed to create an invitation.");
    }
    if (user.invitationId) {
      throw new Error("You already have an invitation.");
    }

    const parsed = coupleCreateInvitationSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new Error(formatCoupleCreateValidation(parsed.error));
    }
    const payload = parsed.data;
    const normalizedSlug = payload.slug.toLowerCase().trim();

    const slugTaken = await InvitationModel.findOne({ slug: normalizedSlug });
    if (slugTaken) {
      throw new Error("This URL slug is already taken. Choose another.");
    }

    const normalizedGuests = (payload.guests ?? []).map((guestRecord) => ({
      guestName: guestRecord.guestName,
      guestSlug: guestSlugFormatter.normalize(
        guestRecord.guestSlug ?? guestRecord.guestName,
      ),
      attendanceStatus: "PENDING" as const,
      companionsCount: 0,
    }));

    const invitation = await InvitationModel.create({
      coupleNames: payload.coupleNames,
      ...(payload.coupleNamesEn ? { coupleNamesEn: payload.coupleNamesEn } : {}),
      slug: normalizedSlug,
      weddingDate: new Date(payload.weddingDate),
      venueName: payload.venueName,
      ...(payload.venueNameEn ? { venueNameEn: payload.venueNameEn } : {}),
      venueAddress: payload.venueAddress,
      ...(payload.venueAddressEn ? { venueAddressEn: payload.venueAddressEn } : {}),
      mapEmbedUrl: payload.mapEmbedUrl,
      coverPhotoUrl: payload.coverPhotoUrl,
      galleryPhotoUrls: payload.galleryPhotoUrls ?? [],
      invitationTheme: normalizeInvitationThemeId(payload.invitationTheme),
      presentationMode: payload.presentationMode ?? "stories",
      invitationExperience: payload.invitationExperience,
      status: "DRAFT",
      coupleOwnerUserId: user._id,
    });

    if (normalizedGuests.length > 0) {
      await GuestModel.insertMany(
        normalizedGuests.map((guestRecord) => ({
          invitationId: invitation._id,
          guestName: guestRecord.guestName,
          guestSlug: guestRecord.guestSlug,
        })),
      );
    }

    user.invitationId = invitation._id;
    user.canCreateInvitation = false;
    await user.save();

    const token = signAccessToken({
      sub: user._id.toString(),
      role: "COUPLE",
      invitationId: invitation._id.toString(),
    });

    const lean = await InvitationModel.findById(invitation._id).lean();
    if (!lean) {
      throw new Error("Could not load invitation after create.");
    }

    return {
      token,
      invitation: withInvitationThemeDefault(lean),
      user: { id: user._id.toString(), email: user.email },
    };
  },
};
