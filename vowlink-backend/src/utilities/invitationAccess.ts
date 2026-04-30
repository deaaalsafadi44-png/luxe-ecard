import type { InvitationStatus } from "../models/Invitation";

export const getEffectiveInvitationStatus = (
  status: InvitationStatus | string | undefined,
): InvitationStatus => {
  if (status === "DRAFT" || status === "PUBLISHED" || status === "DISABLED") {
    return status;
  }
  return "PUBLISHED";
};

export const canViewPublicInvitation = (status: InvitationStatus | undefined): boolean =>
  getEffectiveInvitationStatus(status) === "PUBLISHED";
