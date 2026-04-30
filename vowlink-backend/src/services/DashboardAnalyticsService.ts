import { GuestModel } from "../models/Guest";
import { InvitationModel } from "../models/Invitation";
import mongoose from "mongoose";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";

export const dashboardAnalyticsService = {
  async getInvitationStats(slug: string) {
    const normalizedSlug = slug.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const invitation = inMemoryInvitationStore.getInvitationBySlug(normalizedSlug);
      if (!invitation) {
        return null;
      }

      const guests = inMemoryInvitationStore.getGuests(invitation._id);
      const totalGuests = guests.length;
      const comingGuests = guests.filter(
        (guestRecord) => guestRecord.attendanceStatus === "COMING",
      ).length;
      const notComingGuests = guests.filter(
        (guestRecord) => guestRecord.attendanceStatus === "NOT_COMING",
      ).length;
      const pendingGuests = guests.filter(
        (guestRecord) => guestRecord.attendanceStatus === "PENDING",
      ).length;
      const totalCompanions = guests.reduce(
        (accumulator, guestRecord) => accumulator + guestRecord.companionsCount,
        0,
      );

      return {
        invitation,
        stats: {
          totalGuests,
          comingGuests,
          notComingGuests,
          pendingGuests,
          totalCompanions,
        },
        guests,
      };
    }

    const invitation = await InvitationModel.findOne({
      slug: normalizedSlug,
    }).lean();

    if (!invitation) {
      return null;
    }

    const guests = await GuestModel.find({ invitationId: invitation._id }).lean();
    const totalGuests = guests.length;
    const comingGuests = guests.filter(
      (guestRecord) => guestRecord.attendanceStatus === "COMING",
    ).length;
    const notComingGuests = guests.filter(
      (guestRecord) => guestRecord.attendanceStatus === "NOT_COMING",
    ).length;
    const pendingGuests = guests.filter(
      (guestRecord) => guestRecord.attendanceStatus === "PENDING",
    ).length;
    const totalCompanions = guests.reduce(
      (accumulator, guestRecord) => accumulator + guestRecord.companionsCount,
      0,
    );

    return {
      invitation,
      stats: {
        totalGuests,
        comingGuests,
        notComingGuests,
        pendingGuests,
        totalCompanions,
      },
      guests,
    };
  },
};
