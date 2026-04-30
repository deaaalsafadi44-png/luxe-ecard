import type { Request, Response } from "express";
import { invitationLookupService } from "../services/InvitationLookupService";

export const invitationController = {
  async getInvitationBySlug(request: Request, response: Response) {
    const rawSlug = request.params.slug;
    const guestSlugParam = request.query.guest;
    const invitationSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    const guestSlug =
      typeof guestSlugParam === "string" ? guestSlugParam : undefined;

    if (!invitationSlug) {
      return response.status(400).json({
        message: "Invitation slug is required.",
      });
    }

    const invitationPayload = await invitationLookupService.resolveInvitationForGuest(
      invitationSlug,
      guestSlug,
    );

    if (!invitationPayload) {
      return response.status(404).json({
        message: "Invitation not found.",
      });
    }

    return response.status(200).json(invitationPayload);
  },
};
