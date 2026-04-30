import { randomUUID } from "crypto";
import type { UserRole } from "../models/User";

interface MemoryUserRecord {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  invitationId?: string;
  canCreateInvitation?: boolean;
}

const usersById = new Map<string, MemoryUserRecord>();
const usersByEmail = new Map<string, MemoryUserRecord>();

export const inMemoryUserStore = {
  createUser(params: {
    email: string;
    passwordHash: string;
    role: UserRole;
    invitationId?: string;
    canCreateInvitation?: boolean;
  }) {
    const normalizedEmail = params.email.toLowerCase().trim();
    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }
    if (usersByEmail.has(normalizedEmail)) {
      throw new Error("Email is already registered.");
    }

    const created: MemoryUserRecord = {
      _id: randomUUID(),
      email: normalizedEmail,
      passwordHash: params.passwordHash,
      role: params.role,
      invitationId: params.invitationId,
      canCreateInvitation: params.canCreateInvitation ?? false,
    };

    usersById.set(created._id, created);
    usersByEmail.set(normalizedEmail, created);
    return created;
  },

  findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) return null;
    return usersByEmail.get(normalizedEmail) ?? null;
  },

  findById(userId: string) {
    if (!userId) return null;
    return usersById.get(userId) ?? null;
  },

  updateUser(userId: string, patch: Partial<Omit<MemoryUserRecord, "_id">>) {
    const existing = usersById.get(userId);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    usersById.set(userId, next);
    if (patch.email) {
      usersByEmail.delete(existing.email);
      usersByEmail.set(next.email.toLowerCase().trim(), next);
    }
    return next;
  },

  /** Clear invitation link for every couple user tied to this invitation id. */
  unlinkInvitationFromUsers(invitationId: string) {
    for (const [id, user] of usersById.entries()) {
      if (user.invitationId === invitationId) {
        const next = { ...user, invitationId: undefined };
        usersById.set(id, next);
        usersByEmail.set(user.email.toLowerCase().trim(), next);
      }
    }
  },

  seedPlatformAdmin(user: { email: string; passwordHash: string }) {
    const existing = this.findByEmail(user.email);
    if (existing) return existing;
    return this.createUser({
      email: user.email,
      passwordHash: user.passwordHash,
      role: "PLATFORM_ADMIN",
      canCreateInvitation: false,
    });
  },
};

