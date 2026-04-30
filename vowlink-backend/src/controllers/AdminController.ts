import type { Request, Response } from "express";
import { ZodError } from "zod";
import { dashboardAnalyticsService } from "../services/DashboardAnalyticsService";
import { invitationManagementService } from "../services/InvitationManagementService";
import { verifyAdminInviteKey } from "../utilities/adminInviteSecret";
import { excelGuestExporter } from "../utilities/ExcelGuestExporter";

export const adminController = {
  /** Used by the /admin gate before showing the create-invitation form. */
  async verifyInviteKey(request: Request, response: Response) {
    const key = String(request.body?.key ?? "");
    if (!verifyAdminInviteKey(key)) {
      return response.status(401).json({
        message: "Invalid admin invite key.",
      });
    }
    return response.status(204).send();
  },

  async createInvitation(request: Request, response: Response) {
    try {
      const invitation = await invitationManagementService.createInvitationWithGuests(
        request.body,
      );
      return response.status(201).json(invitation);
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(422).json({
          message: "Invitation payload is invalid.",
          issues: error.flatten(),
        });
      }
      return response.status(422).json({
        message: "Invitation payload is invalid.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDashboardStats(request: Request, response: Response) {
    const rawSlug = request.params.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    if (!slug) {
      return response.status(400).json({ message: "Invitation slug is required." });
    }

    const summary = await dashboardAnalyticsService.getInvitationStats(slug);

    if (!summary) {
      return response.status(404).json({ message: "Invitation not found." });
    }

    return response.status(200).json(summary);
  },

  async exportGuestsAsExcel(request: Request, response: Response) {
    const rawSlug = request.params.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    if (!slug) {
      return response.status(400).json({ message: "Invitation slug is required." });
    }

    const summary = await dashboardAnalyticsService.getInvitationStats(slug);

    if (!summary) {
      return response.status(404).json({ message: "Invitation not found." });
    }

    const workbookBuffer = excelGuestExporter.buildWorkbookBuffer(summary.guests);
    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="vowlink-guests-${slug}.xlsx"`,
    );

    return response.status(200).send(workbookBuffer);
  },
};
