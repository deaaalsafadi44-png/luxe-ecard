import type { Request, Response } from "express";
import { invitationManagementService } from "../services/InvitationManagementService";

export const rsvpController = {
  async updateGuestAttendance(request: Request, response: Response) {
    try {
      const rawInvitationSlug = request.params.slug;
      const rawGuestSlug = request.params.guestSlug;
      const invitationSlug = Array.isArray(rawInvitationSlug)
        ? rawInvitationSlug[0]
        : rawInvitationSlug;
      const guestSlug = Array.isArray(rawGuestSlug) ? rawGuestSlug[0] : rawGuestSlug;

      if (!invitationSlug || !guestSlug) {
        return response.status(400).json({ message: "Slug values are required." });
      }

      const updatedGuest = await invitationManagementService.updateGuestRsvp(
        invitationSlug,
        guestSlug,
        request.body,
      );

      if (!updatedGuest) {
        return response.status(404).json({ message: "Guest not found." });
      }

      return response.status(200).json(updatedGuest);
    } catch (error) {
      return response.status(422).json({
        message: "Invalid RSVP payload.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
