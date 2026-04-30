import { Schema, model, type Document, type Types } from "mongoose";

export type UserRole = "PLATFORM_ADMIN" | "COUPLE";

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  /** When true, couple may create their invitation (no invitationId yet). Set by platform owner. */
  canCreateInvitation?: boolean;
  invitationId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["PLATFORM_ADMIN", "COUPLE"],
      required: true,
    },
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
      index: true,
    },
    canCreateInvitation: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>("User", UserSchema);
