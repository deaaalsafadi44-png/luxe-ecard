import { z } from "zod";
import mongoose from "mongoose";
import { GuestModel } from "../models/Guest";
import { InvitationModel } from "../models/Invitation";
import { guestSlugFormatter } from "../utilities/GuestSlugFormatter";
import { canViewPublicInvitation } from "../utilities/invitationAccess";
import { normalizeInvitationThemeId } from "../constants/invitationTheme";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import type {
  CreateInvitationPayload,
  RSVPUpdatePayload,
} from "../types/InvitationTypes";

const optionalUrlField = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
}, z.string().url().optional());

/** Valid URL used when the form leaves the map field empty (user can edit later). */
const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDAwJzAwLjAiTiAwwrAwMCcwMC4wIkU!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus";

const mapEmbedUrlField = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_MAP_EMBED_URL;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}, z.string().url());

const createInvitationSchema = z.object({
  coupleNames: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  weddingDate: z.string().trim().min(1),
  venueName: z.string().trim().min(2),
  venueAddress: z.string().trim().min(3),
  mapEmbedUrl: mapEmbedUrlField,
  coverPhotoUrl: optionalUrlField,
  galleryPhotoUrls: z.array(z.string().url()).optional(),
  invitationTheme: z
    .enum(["royal", "sage", "midnight", "blush", "ivory"])
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "DISABLED"]).optional(),
  guests: z
    .array(
      z.object({
        guestName: z.string().trim().min(1),
        guestSlug: z.string().trim().min(1).optional(),
      }),
    )
    .default([]),
});

const rsvpSchema = z.object({
  status: z.enum(["COMING", "NOT_COMING", "PENDING"]),
});

export const invitationManagementService = {
  async createInvitationWithGuests(rawPayload: CreateInvitationPayload) {
    const payload = createInvitationSchema.parse(rawPayload);
    const normalizedSlug = payload.slug.toLowerCase().trim();
    const normalizedGuests = payload.guests.map((guestRecord) => ({
      guestName: guestRecord.guestName,
      guestSlug: guestSlugFormatter.normalize(
        guestRecord.guestSlug ?? guestRecord.guestName,
      ),
      attendanceStatus: "PENDING" as const,
      companionsCount: 0,
      allowedCompanions: 0,
      tableNumber: "",
    }));

    if (mongoose.connection.readyState !== 1) {
      const memoryInvitation = inMemoryInvitationStore.createInvitation({
        coupleNames: payload.coupleNames,
        slug: normalizedSlug,
        weddingDate: new Date(payload.weddingDate),
        venueName: payload.venueName,
        venueAddress: payload.venueAddress,
        mapEmbedUrl: payload.mapEmbedUrl,
        coverPhotoUrl: payload.coverPhotoUrl,
        galleryPhotoUrls: payload.galleryPhotoUrls ?? [],
        invitationTheme: normalizeInvitationThemeId(payload.invitationTheme),
        presentationMode: "classic",
        status: payload.status ?? "DRAFT",
      });
      inMemoryInvitationStore.addGuests(memoryInvitation._id, normalizedGuests);
      return memoryInvitation;
    }

    const invitation = await InvitationModel.create({
      coupleNames: payload.coupleNames,
      slug: normalizedSlug,
      weddingDate: new Date(payload.weddingDate),
      venueName: payload.venueName,
      venueAddress: payload.venueAddress,
      mapEmbedUrl: payload.mapEmbedUrl,
      coverPhotoUrl: payload.coverPhotoUrl,
      galleryPhotoUrls: payload.galleryPhotoUrls ?? [],
      invitationTheme: normalizeInvitationThemeId(payload.invitationTheme),
      presentationMode: "classic",
      status: payload.status ?? "DRAFT",
    });

    if (normalizedGuests.length > 0) {
      await GuestModel.insertMany(
        normalizedGuests.map((guestRecord) => ({
          invitationId: invitation._id,
          guestName: guestRecord.guestName,
          guestSlug: guestRecord.guestSlug,
          allowedCompanions: guestRecord.allowedCompanions,
          tableNumber: guestRecord.tableNumber,
        })),
      );
    }

    return invitation;
  },

  async updateGuestRsvp(
    invitationSlug: string,
    guestSlug: string,
    rawPayload: RSVPUpdatePayload,
  ) {
    const payload = rsvpSchema.parse(rawPayload);
    const normalizedInvitationSlug = invitationSlug.toLowerCase().trim();
    const normalizedGuestSlug = guestSlugFormatter.normalize(guestSlug);

    if (mongoose.connection.readyState !== 1) {
      const memoryInvitation =
        inMemoryInvitationStore.getInvitationBySlug(normalizedInvitationSlug);
      if (!memoryInvitation) {
        return null;
      }
      if (!canViewPublicInvitation(memoryInvitation.status)) {
        return null;
      }

      return inMemoryInvitationStore.updateGuestRsvp(
        memoryInvitation._id,
        normalizedGuestSlug,
        payload,
      );
    }

    const invitation = await InvitationModel.findOne({
      slug: normalizedInvitationSlug,
    });

    if (!invitation) {
      return null;
    }

    if (!canViewPublicInvitation(invitation.status)) {
      return null;
    }

    const updatedGuest = await GuestModel.findOneAndUpdate(
      {
        invitationId: invitation._id,
        guestSlug: normalizedGuestSlug,
      },
      {
        attendanceStatus: payload.status,
        companionsCount: 0,
      },
      { new: true },
    ).lean();

    return updatedGuest;
  },
};
