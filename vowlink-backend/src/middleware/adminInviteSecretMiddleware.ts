import type { NextFunction, Request, Response } from "express";
import {
  getAdminInvitationSecret,
  verifyAdminInviteKey,
} from "../utilities/adminInviteSecret";

const HEADER = "x-admin-invite-key";

/**
 * When `ADMIN_INVITATION_CREATE_SECRET` is set, POST /admin/invitations must send
 * the same value in `X-Admin-Invite-Key`. When unset, the route stays open (local dev).
 */
export function requireAdminInviteSecret(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!getAdminInvitationSecret()) {
    return next();
  }

  const provided = String(request.headers[HEADER] ?? "").trim();
  if (!verifyAdminInviteKey(provided)) {
    return response.status(401).json({
      message: "Invalid admin invite key.",
    });
  }

  return next();
}
