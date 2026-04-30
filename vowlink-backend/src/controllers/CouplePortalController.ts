import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { authService } from "../services/AuthService";
import { coupleGuestService } from "../services/CoupleGuestService";
import { coupleInvitationCreationService } from "../services/CoupleInvitationCreationService";
import { coupleInvitationEditorService } from "../services/CoupleInvitationEditorService";
import { dashboardAnalyticsService } from "../services/DashboardAnalyticsService";

export const couplePortalController = {
  async getMyInvitation(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const context = await authService.getCoupleContext(userId);
    if (!context) {
      return response.status(404).json({ message: "Account not found." });
    }

    if (!context.invitation) {
      return response.status(200).json({
        invitation: null,
        canCreateInvitation: Boolean(context.user.canCreateInvitation),
      });
    }

    const invitation = await coupleInvitationEditorService.getInvitationForEditor(
      context.invitation._id.toString(),
    );
    return response.status(200).json({
      invitation,
      canCreateInvitation: false,
    });
  },

  async createMyInvitation(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    try {
      const result = await coupleInvitationCreationService.createForCoupleUser(
        userId,
        request.body,
      );
      return response.status(201).json({
        token: result.token,
        invitation: result.invitation,
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create invitation.";
      const status = message.includes("already") || message.includes("not allowed") ? 422 : 400;
      return response.status(status).json({ message });
    }
  },

  async updateMyInvitation(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const context = await authService.getCoupleContext(userId);
    if (!context?.invitation) {
      return response.status(404).json({ message: "No invitation linked." });
    }

    try {
      const updated = await coupleInvitationEditorService.updateInvitationForCouple(
        context.invitation._id.toString(),
        request.body,
      );
      if (!updated) {
        return response.status(404).json({ message: "Invitation not found." });
      }
      return response.status(200).json({ invitation: updated });
    } catch (error) {
      return response.status(422).json({
        message: error instanceof Error ? error.message : "Validation failed.",
      });
    }
  },

  async listGuests(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const guests = await coupleGuestService.listForCoupleUser(userId);
    if (!guests) {
      return response.status(404).json({ message: "No invitation linked." });
    }
    return response.status(200).json({ guests });
  },

  async addGuest(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    try {
      const guest = await coupleGuestService.addForCoupleUser(userId, request.body);
      return response.status(201).json({ guest });
    } catch (error) {
      return response.status(422).json({
        message: error instanceof Error ? error.message : "Could not add guest.",
      });
    }
  },

  async getMyRsvpDashboard(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const context = await authService.getCoupleContext(userId);
    if (!context?.invitation) {
      return response.status(404).json({ message: "No invitation linked." });
    }

    const slug = context.invitation.slug;
    const summary = await dashboardAnalyticsService.getInvitationStats(slug);
    if (!summary) {
      return response.status(404).json({ message: "Invitation not found." });
    }

    return response.status(200).json(summary);
  },
};
