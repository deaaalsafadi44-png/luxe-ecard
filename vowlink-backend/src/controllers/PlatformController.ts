import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { authService } from "../services/AuthService";
import { platformInvitationAdminService } from "../services/PlatformInvitationAdminService";
import type { InvitationStatus } from "../models/Invitation";

export const platformController = {
  async listInvitations(_request: AuthenticatedRequest, response: Response) {
    try {
      const invitations = await platformInvitationAdminService.listInvitations();
      return response.status(200).json({ invitations });
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Failed to list invitations.",
      });
    }
  },

  async updateInvitation(request: AuthenticatedRequest, response: Response) {
    try {
      const rawSlug = request.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
      if (!slug) {
        return response.status(400).json({ message: "Slug is required." });
      }

      const body = request.body as {
        status?: InvitationStatus;
      };

      const patch: { status?: InvitationStatus } = {};
      if (body.status !== undefined) patch.status = body.status;

      const updated =
        await platformInvitationAdminService.updateInvitationControls(slug, patch);
      if (!updated) {
        return response.status(404).json({ message: "Invitation not found." });
      }
      return response.status(200).json(updated);
    } catch (error) {
      return response.status(422).json({
        message: error instanceof Error ? error.message : "Update failed.",
      });
    }
  },

  async deleteInvitation(request: AuthenticatedRequest, response: Response) {
    try {
      const rawSlug = request.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
      if (!slug) {
        return response.status(400).json({ message: "Slug is required." });
      }

      const deleted = await platformInvitationAdminService.deleteInvitationBySlug(
        slug,
      );
      if (!deleted) {
        return response.status(404).json({ message: "Invitation not found." });
      }
      return response.status(204).send();
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Delete failed.",
      });
    }
  },

  async createCoupleAccount(request: AuthenticatedRequest, response: Response) {
    try {
      const email = String(request.body?.email ?? "");
      const password = String(request.body?.password ?? "");
      const invitationSlug = String(request.body?.invitationSlug ?? "").trim();
      const allowCreateInvitation = Boolean(request.body?.allowCreateInvitation);
      const created = await authService.createCoupleUserByAdmin(email, password, {
        invitationSlug,
        allowCreateInvitation,
      });
      return response.status(201).json(created);
    } catch (error) {
      return response.status(422).json({
        message: error instanceof Error ? error.message : "Could not create account.",
      });
    }
  },
};
