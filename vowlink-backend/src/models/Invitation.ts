import { Schema, model, type Document, type Types } from "mongoose";
import {
  DEFAULT_INVITATION_THEME,
  INVITATION_THEME_IDS,
  type InvitationThemeId,
} from "../constants/invitationTheme";
import type {
  InvitationExperience,
  PresentationMode,
} from "../types/InvitationExperience";

export type InvitationStatus = "DRAFT" | "PUBLISHED" | "DISABLED";
export type { InvitationThemeId };

export interface InvitationDocument extends Document {
  coupleNames: string;
  coupleNamesEn?: string;
  slug: string;
  weddingDate: Date;
  venueName: string;
  venueNameEn?: string;
  venueAddress: string;
  venueAddressEn?: string;
  mapEmbedUrl: string;
  coverPhotoUrl?: string;
  galleryPhotoUrls: string[];
  invitationTheme: InvitationThemeId;
  /** classic = long scroll page; stories = full-screen swipe slides (Evologic-style). */
  presentationMode: PresentationMode;
  invitationExperience?: InvitationExperience;
  status: InvitationStatus;
  coupleOwnerUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<InvitationDocument>(
  {
    coupleNames: {
      type: String,
      required: true,
      trim: true,
    },
    coupleNamesEn: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    weddingDate: {
      type: Date,
      required: true,
    },
    venueName: {
      type: String,
      required: true,
      trim: true,
    },
    venueNameEn: {
      type: String,
      trim: true,
    },
    venueAddress: {
      type: String,
      required: true,
      trim: true,
    },
    venueAddressEn: {
      type: String,
      trim: true,
    },
    mapEmbedUrl: {
      type: String,
      required: true,
      trim: true,
    },
    coverPhotoUrl: {
      type: String,
      trim: true,
    },
    galleryPhotoUrls: {
      type: [String],
      default: [],
    },
    invitationTheme: {
      type: String,
      enum: [...INVITATION_THEME_IDS],
      default: DEFAULT_INVITATION_THEME,
    },
    presentationMode: {
      type: String,
      enum: ["classic", "stories"],
      default: "classic",
    },
    invitationExperience: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "DISABLED"],
      default: "DRAFT",
    },
    coupleOwnerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const InvitationModel = model<InvitationDocument>(
  "Invitation",
  InvitationSchema,
);
