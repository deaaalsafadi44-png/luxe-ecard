import mongoose from "mongoose";
import { GuestModel } from "../models/Guest";
import { InvitationModel } from "../models/Invitation";
import { guestSlugFormatter } from "../utilities/GuestSlugFormatter";
import { canViewPublicInvitation } from "../utilities/invitationAccess";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { withInvitationThemeDefault } from "../utilities/invitationSerialization";

export interface ResolveInvitationOptions {
  /** When true (default for public pages), only PUBLISHED invitations are returned. */
  publicAccess?: boolean;
}

export const invitationLookupService = {
  async resolveInvitationForGuest(
    slug: string,
    guestSlug?: string,
    options: ResolveInvitationOptions = {},
  ) {
    const publicAccess = options.publicAccess !== false;
    const normalizedSlug = slug.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const invitation =
        inMemoryInvitationStore.getInvitationBySlug(normalizedSlug);
      if (!invitation) {
        return null;
      }
      if (publicAccess && !canViewPublicInvitation(invitation.status)) {
        return null;
      }

      if (!guestSlug) {
        return { invitation, guest: null };
      }

      const guest = inMemoryInvitationStore.getGuestBySlug(
        invitation._id,
        guestSlugFormatter.normalize(guestSlug),
      );

      return { invitation, guest };
    }

    const invitation = await InvitationModel.findOne({
      slug: normalizedSlug,
    }).lean();

    if (!invitation) {
      return null;
    }

    if (publicAccess && !canViewPublicInvitation(invitation.status)) {
      return null;
    }

    if (!guestSlug) {
      return {
        invitation: withInvitationThemeDefault(invitation),
        guest: null,
      };
    }

    const guest = await GuestModel.findOne({
      invitationId: invitation._id,
      guestSlug: guestSlugFormatter.normalize(guestSlug),
    }).lean();

    return {
      invitation: withInvitationThemeDefault(invitation),
      guest,
    };
  },
};
