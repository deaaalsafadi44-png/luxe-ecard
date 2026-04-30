import mongoose from "mongoose";
import { z } from "zod";
import { GuestModel } from "../models/Guest";
import { UserModel } from "../models/User";
import { guestSlugFormatter } from "../utilities/GuestSlugFormatter";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { inMemoryUserStore } from "../utilities/InMemoryUserStore";

const addGuestSchema = z.object({
  guestName: z.string().trim().min(1),
  guestSlug: z.string().trim().min(1).optional(),
});

export const coupleGuestService = {
  async listForCoupleUser(userId: string) {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId).lean();
      if (!user || user.role !== "COUPLE" || !user.invitationId) return null;

      const guests = await GuestModel.find({ invitationId: user.invitationId })
        .sort({ guestName: 1 })
        .lean();
      return guests.map((g) => ({
        _id: g._id.toString(),
        guestName: g.guestName,
        guestSlug: g.guestSlug,
        attendanceStatus: g.attendanceStatus,
        companionsCount: g.companionsCount,
      }));
    }

    const memoryUser = inMemoryUserStore.findById(userId);
    if (!memoryUser || memoryUser.role !== "COUPLE" || !memoryUser.invitationId) return null;

    const guests = inMemoryInvitationStore.getGuests(memoryUser.invitationId);
    return guests
      .slice()
      .sort((a, b) => a.guestName.localeCompare(b.guestName))
      .map((g) => ({
        _id: g._id,
        guestName: g.guestName,
        guestSlug: g.guestSlug,
        attendanceStatus: g.attendanceStatus,
        companionsCount: g.companionsCount,
      }));
  },

  async addForCoupleUser(userId: string, rawBody: unknown) {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId);
      if (!user || user.role !== "COUPLE" || !user.invitationId) {
        throw new Error("No invitation linked to this account.");
      }

      const body = addGuestSchema.parse(rawBody);
      const guestSlug = guestSlugFormatter.normalize(body.guestSlug ?? body.guestName);

      const duplicate = await GuestModel.findOne({
        invitationId: user.invitationId,
        guestSlug,
      });
      if (duplicate) {
        throw new Error("A guest with this link name already exists.");
      }

      const created = await GuestModel.create({
        invitationId: user.invitationId,
        guestName: body.guestName.trim(),
        guestSlug,
      });

      return {
        _id: created._id.toString(),
        guestName: created.guestName,
        guestSlug: created.guestSlug,
        attendanceStatus: created.attendanceStatus,
        companionsCount: created.companionsCount,
      };
    }

    // Degraded mode: in-memory guests.
    const memoryUser = inMemoryUserStore.findById(userId);
    if (!memoryUser || memoryUser.role !== "COUPLE" || !memoryUser.invitationId) {
      throw new Error("No invitation linked to this account.");
    }

    const body = addGuestSchema.parse(rawBody);
    const guestSlug = guestSlugFormatter.normalize(body.guestSlug ?? body.guestName);

    const duplicate = inMemoryInvitationStore.getGuestBySlug(memoryUser.invitationId, guestSlug);
    if (duplicate) {
      throw new Error("A guest with this link name already exists.");
    }

    const created = inMemoryInvitationStore.addGuests(memoryUser.invitationId, [
      {
        guestName: body.guestName.trim(),
        guestSlug,
        attendanceStatus: "PENDING",
        companionsCount: 0,
      },
    ])[0];

    return {
      _id: created._id,
      guestName: created.guestName,
      guestSlug: created.guestSlug,
      attendanceStatus: created.attendanceStatus,
      companionsCount: created.companionsCount,
    };
  },
};
