import mongoose from "mongoose";
import { GuestModel } from "../models/Guest";
import { InvitationModel } from "../models/Invitation";
import type { InvitationStatus } from "../models/Invitation";
import { UserModel } from "../models/User";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { inMemoryUserStore } from "../utilities/InMemoryUserStore";

export const platformInvitationAdminService = {
  async listInvitations() {
    if (mongoose.connection.readyState !== 1) {
      return inMemoryInvitationStore.listInvitations().map((inv) => ({
        ...inv,
        weddingDate: inv.weddingDate.toISOString(),
      }));
    }

    const rows = await InvitationModel.find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
    return rows.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      coupleOwnerUserId: doc.coupleOwnerUserId
        ? doc.coupleOwnerUserId.toString()
        : undefined,
      weddingDate:
        doc.weddingDate instanceof Date
          ? doc.weddingDate.toISOString()
          : String(doc.weddingDate),
    }));
  },

  async updateInvitationControls(
    slug: string,
    patch: { status?: InvitationStatus },
  ) {
    const normalizedSlug = slug.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const updated = inMemoryInvitationStore.updateInvitationBySlug(
        normalizedSlug,
        patch,
      );
      return updated;
    }

    const updated = await InvitationModel.findOneAndUpdate(
      { slug: normalizedSlug },
      { $set: patch },
      { new: true },
    ).lean();

    return updated;
  },

  /**
   * Permanently delete invitation + guests; unlink couple users from this invitation.
   */
  async deleteInvitationBySlug(slug: string) {
    const normalizedSlug = slug.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const inv = inMemoryInvitationStore.getInvitationBySlug(normalizedSlug);
      if (!inv) {
        return false;
      }
      inMemoryUserStore.unlinkInvitationFromUsers(inv._id);
      return inMemoryInvitationStore.deleteInvitationBySlug(normalizedSlug);
    }

    const invitation = await InvitationModel.findOne({
      slug: normalizedSlug,
    }).lean();

    if (!invitation) {
      return false;
    }

    const invitationObjectId = invitation._id;

    await GuestModel.deleteMany({ invitationId: invitationObjectId });
    await UserModel.updateMany(
      { invitationId: invitationObjectId },
      { $unset: { invitationId: 1 } },
    );
    await InvitationModel.deleteOne({ _id: invitationObjectId });

    return true;
  },
};
