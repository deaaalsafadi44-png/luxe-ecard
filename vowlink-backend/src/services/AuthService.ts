import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { signAccessToken } from "../config/authTokens";
import { InvitationModel } from "../models/Invitation";
import { UserModel } from "../models/User";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";
import { inMemoryUserStore } from "../utilities/InMemoryUserStore";

const SALT_ROUNDS = 11;

export const authService = {
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error("Invalid credentials.");

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        // Fallback to in-memory users in case Mongo is connected but the user
        // was created during degraded mode.
        const memoryUser = inMemoryUserStore.findByEmail(normalizedEmail);
        if (!memoryUser) throw new Error("Invalid credentials.");

        const valid = await bcrypt.compare(password, memoryUser.passwordHash);
        if (!valid) throw new Error("Invalid credentials.");

        const token = signAccessToken({
          sub: memoryUser._id,
          role: memoryUser.role,
          invitationId: memoryUser.invitationId,
        });

        return {
          token,
          user: {
            id: memoryUser._id,
            email: memoryUser.email,
            role: memoryUser.role,
            invitationId: memoryUser.invitationId,
          },
        };
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error("Invalid credentials.");

      const token = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
        invitationId: user.invitationId?.toString(),
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          invitationId: user.invitationId?.toString(),
        },
      };
    }

    // Degraded mode: in-memory auth.
    const memoryUser = inMemoryUserStore.findByEmail(normalizedEmail);
    if (!memoryUser) throw new Error("Invalid credentials.");

    const valid = await bcrypt.compare(password, memoryUser.passwordHash);
    if (!valid) throw new Error("Invalid credentials.");

    const token = signAccessToken({
      sub: memoryUser._id,
      role: memoryUser.role,
      invitationId: memoryUser.invitationId,
    });

    return {
      token,
      user: {
        id: memoryUser._id,
        email: memoryUser.email,
        role: memoryUser.role,
        invitationId: memoryUser.invitationId,
      },
    };
  },

  async createCoupleUserByAdmin(
    email: string,
    password: string,
    options: {
      invitationSlug?: string;
      allowCreateInvitation?: boolean;
    } = {},
  ) {
    const invitationSlug = (options.invitationSlug ?? "").toLowerCase().trim();
    const allowCreateInvitation = Boolean(options.allowCreateInvitation);

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      if (allowCreateInvitation && !invitationSlug) {
        const existing = await UserModel.findOne({ email: normalizedEmail });
        if (existing) throw new Error("Email is already registered.");

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await UserModel.create({
          email: normalizedEmail,
          passwordHash,
          role: "COUPLE",
          canCreateInvitation: true,
        });

        return {
          id: user._id.toString(),
          email: user.email,
          invitationSlug: null as string | null,
          allowCreateInvitation: true,
        };
      }

      if (!invitationSlug) {
        throw new Error(
          "Provide invitationSlug, or set allowCreateInvitation to create an account without a linked invitation.",
        );
      }

      const invitation = await InvitationModel.findOne({ slug: invitationSlug });
      if (!invitation) throw new Error("Invitation not found.");

      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) throw new Error("Email is already registered.");

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await UserModel.create({
        email: normalizedEmail,
        passwordHash,
        role: "COUPLE",
        invitationId: invitation._id,
        canCreateInvitation: false,
      });

      await InvitationModel.updateOne(
        { _id: invitation._id },
        { $set: { updatedAt: new Date() } },
      );

      return {
        id: user._id.toString(),
        email: user.email,
        invitationSlug,
        allowCreateInvitation: false,
      };
    }

    // Degraded mode: in-memory creation
    const existing = inMemoryUserStore.findByEmail(normalizedEmail);
    if (existing) throw new Error("Email is already registered.");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (allowCreateInvitation && !invitationSlug) {
      const user = inMemoryUserStore.createUser({
        email: normalizedEmail,
        passwordHash,
        role: "COUPLE",
        canCreateInvitation: true,
      });

      return {
        id: user._id,
        email: user.email,
        invitationSlug: null as string | null,
        allowCreateInvitation: true,
      };
    }

    if (!invitationSlug) {
      throw new Error(
        "Provide invitationSlug, or set allowCreateInvitation to create an account without a linked invitation.",
      );
    }

    const invitation = inMemoryInvitationStore.getInvitationBySlug(invitationSlug);
    if (!invitation) throw new Error("Invitation not found.");

    const user = inMemoryUserStore.createUser({
      email: normalizedEmail,
      passwordHash,
      role: "COUPLE",
      invitationId: invitation._id,
      canCreateInvitation: false,
    });

    return {
      id: user._id,
      email: user.email,
      invitationSlug,
      allowCreateInvitation: false,
    };
  },

  async getCoupleContext(userId: string) {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId).lean();
      if (!user || user.role !== "COUPLE") {
        const memoryUser = inMemoryUserStore.findById(userId);
        if (!memoryUser || memoryUser.role !== "COUPLE") return null;

        const canCreateInvitation = Boolean(memoryUser.canCreateInvitation);
        if (!memoryUser.invitationId) {
          if (!canCreateInvitation) return null;
          return { user: memoryUser, invitation: null };
        }

        const invitation = inMemoryInvitationStore.getInvitationById(
          memoryUser.invitationId,
        );
        if (!invitation) {
          inMemoryUserStore.updateUser(memoryUser._id, {
            invitationId: undefined,
            canCreateInvitation: true,
          });
          const repaired = inMemoryUserStore.findById(memoryUser._id);
          if (!repaired) return null;
          return { user: repaired, invitation: null };
        }
        return { user: memoryUser, invitation };
      }

      const canCreateInvitation = Boolean(user.canCreateInvitation);

      if (!user.invitationId) {
        if (!canCreateInvitation) return null;
        return { user, invitation: null };
      }

      const invitation = await InvitationModel.findById(user.invitationId).lean();
      if (!invitation) {
        await UserModel.updateOne(
          { _id: user._id },
          { $unset: { invitationId: 1 }, $set: { canCreateInvitation: true } },
        );
        const fresh = await UserModel.findById(userId).lean();
        if (!fresh || fresh.role !== "COUPLE") return null;
        return { user: fresh, invitation: null };
      }
      return { user, invitation };
    }

    // Degraded mode: in-memory context
    const memoryUser = inMemoryUserStore.findById(userId);
    if (!memoryUser || memoryUser.role !== "COUPLE") return null;

    const canCreateInvitation = Boolean(memoryUser.canCreateInvitation);

    if (!memoryUser.invitationId) {
      if (!canCreateInvitation) return null;
      return { user: memoryUser, invitation: null };
    }

    const invitation = inMemoryInvitationStore.getInvitationById(
      memoryUser.invitationId,
    );
    if (!invitation) {
      inMemoryUserStore.updateUser(memoryUser._id, {
        invitationId: undefined,
        canCreateInvitation: true,
      });
      const repaired = inMemoryUserStore.findById(memoryUser._id);
      if (!repaired) return null;
      return { user: repaired, invitation: null };
    }
    return { user: memoryUser, invitation };
  },
};
