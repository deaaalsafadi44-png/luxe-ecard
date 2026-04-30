import crypto from "crypto";

export function getAdminInvitationSecret(): string | undefined {
  const raw = process.env.ADMIN_INVITATION_CREATE_SECRET?.trim();
  return raw || undefined;
}

/** True when no secret is configured (dev) or when `provided` matches the secret. */
export function verifyAdminInviteKey(provided: string): boolean {
  const secret = getAdminInvitationSecret();
  if (!secret) {
    return true;
  }
  const trimmed = provided.trim();
  if (!trimmed) {
    return false;
  }
  const a = Buffer.from(secret, "utf8");
  const b = Buffer.from(trimmed, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}
