export type AttendanceStatus = "COMING" | "NOT_COMING" | "PENDING";

export type InvitationLifecycleStatus = "DRAFT" | "PUBLISHED" | "DISABLED";

export type InvitationThemeId =
  | "royal"
  | "sage"
  | "midnight"
  | "blush"
  | "ivory";

export interface CreateInvitationPayload {
  coupleNames: string;
  slug: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  mapEmbedUrl: string;
  coverPhotoUrl?: string;
  galleryPhotoUrls?: string[];
  invitationTheme?: InvitationThemeId;
  status?: InvitationLifecycleStatus;
  guests?: Array<{
    guestName: string;
    guestSlug?: string;
  }>;
}

export interface RSVPUpdatePayload {
  status: AttendanceStatus;
  companionsCount: number;
}
