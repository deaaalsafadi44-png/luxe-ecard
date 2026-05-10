import { randomUUID } from "crypto";
import { DEFAULT_INVITATION_THEME } from "../constants/invitationTheme";
import type { InvitationStatus, InvitationThemeId } from "../models/Invitation";
import type {
  InvitationExperience,
  PresentationMode,
} from "../types/InvitationExperience";
import type { AttendanceStatus, RSVPUpdatePayload } from "../types/InvitationTypes";

interface MemoryInvitationRecord {
  _id: string;
  coupleNames: string;
  slug: string;
  weddingDate: Date;
  venueName: string;
  venueAddress: string;
  mapEmbedUrl: string;
  coverPhotoUrl?: string;
  galleryPhotoUrls: string[];
  invitationTheme: InvitationThemeId;
  presentationMode: PresentationMode;
  invitationExperience?: InvitationExperience;
  status: InvitationStatus;
}

interface MemoryGuestRecord {
  _id: string;
  invitationId: string;
  guestName: string;
  guestSlug: string;
  attendanceStatus: AttendanceStatus;
  companionsCount: number;
}

const invitations = new Map<string, MemoryInvitationRecord>();
const guests = new Map<string, MemoryGuestRecord[]>();

export const inMemoryInvitationStore = {
  createInvitation(
    record: Omit<
      MemoryInvitationRecord,
      "_id" | "status" | "invitationTheme" | "presentationMode" | "invitationExperience"
    > & {
      status?: InvitationStatus;
      invitationTheme?: InvitationThemeId;
      presentationMode?: PresentationMode;
      invitationExperience?: InvitationExperience;
    },
  ) {
    const created: MemoryInvitationRecord = {
      ...record,
      invitationTheme: record.invitationTheme ?? DEFAULT_INVITATION_THEME,
      presentationMode: record.presentationMode ?? "classic",
      invitationExperience: record.invitationExperience,
      _id: randomUUID(),
      status: record.status ?? "DRAFT",
    };
    invitations.set(created.slug, created);
    guests.set(created._id, []);
    return created;
  },

  updateInvitationBySlug(
    slug: string,
    patch: Partial<
      Pick<
        MemoryInvitationRecord,
        | "coupleNames"
        | "weddingDate"
        | "venueName"
        | "venueAddress"
        | "mapEmbedUrl"
        | "coverPhotoUrl"
        | "galleryPhotoUrls"
        | "invitationTheme"
        | "presentationMode"
        | "invitationExperience"
        | "status"
      >
    >,
  ) {
    const existing = invitations.get(slug.toLowerCase().trim());
    if (!existing) return null;
    const next = { ...existing, ...patch };
    invitations.set(next.slug, next);
    return next;
  },

  addGuests(
    invitationId: string,
    guestRecords: Array<Omit<MemoryGuestRecord, "_id" | "invitationId">>,
  ) {
    const existing = guests.get(invitationId) ?? [];
    const enriched = guestRecords.map((guestRecord) => ({
      ...guestRecord,
      _id: randomUUID(),
      invitationId,
    }));
    guests.set(invitationId, [...existing, ...enriched]);
    return enriched;
  },

  getInvitationBySlug(slug: string) {
    return invitations.get(slug.toLowerCase().trim());
  },

  getInvitationById(invitationId: string) {
    for (const inv of invitations.values()) {
      if (inv._id === invitationId) {
        return inv;
      }
    }
    return undefined;
  },

  getGuestBySlug(invitationId: string, guestSlug: string) {
    const invitationGuests = guests.get(invitationId) ?? [];
    return invitationGuests.find((record) => record.guestSlug === guestSlug) ?? null;
  },

  updateGuestRsvp(invitationId: string, guestSlug: string, payload: RSVPUpdatePayload) {
    const invitationGuests = guests.get(invitationId) ?? [];
    const target = invitationGuests.find((record) => record.guestSlug === guestSlug);
    if (!target) {
      return null;
    }

    target.attendanceStatus = payload.status;
    target.companionsCount = 0;
    return target;
  },

  getGuests(invitationId: string) {
    return guests.get(invitationId) ?? [];
  },

  listInvitations() {
    return Array.from(invitations.values());
  },

  /** Remove invitation and its guests; map key is normalized slug. */
  deleteInvitationBySlug(slug: string) {
    const key = slug.toLowerCase().trim();
    const inv = invitations.get(key);
    if (!inv) {
      return false;
    }
    guests.delete(inv._id);
    invitations.delete(key);
    return true;
  },
};
