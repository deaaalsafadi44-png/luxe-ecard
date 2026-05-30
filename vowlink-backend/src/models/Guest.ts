import { Schema, model, type Document, type Types } from "mongoose";

export type AttendanceResponse = "COMING" | "NOT_COMING" | "PENDING";

export interface GuestDocument extends Document {
  invitationId: Types.ObjectId;
  guestName: string;
  guestSlug: string;
  attendanceStatus: AttendanceResponse;
  /** RSVP companions actually confirmed (legacy; not shown to guests). */
  companionsCount: number;
  /** How many companions this guest may bring (party size = 1 + this). */
  allowedCompanions: number;
  /** Assigned table label/number for seating. */
  tableNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<GuestDocument>(
  {
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    attendanceStatus: {
      type: String,
      enum: ["COMING", "NOT_COMING", "PENDING"],
      default: "PENDING",
    },
    companionsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    allowedCompanions: {
      type: Number,
      min: 0,
      max: 20,
      default: 0,
    },
    tableNumber: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

GuestSchema.index({ invitationId: 1, guestSlug: 1 }, { unique: true });

export const GuestModel = model<GuestDocument>("Guest", GuestSchema);
