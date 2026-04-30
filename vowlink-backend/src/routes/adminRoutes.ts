import { Router } from "express";
import { adminController } from "../controllers/AdminController";
import { requireAdminInviteSecret } from "../middleware/adminInviteSecretMiddleware";

export const adminRouter = Router();

adminRouter.post("/verify-invite-key", adminController.verifyInviteKey);
adminRouter.post(
  "/invitations",
  requireAdminInviteSecret,
  adminController.createInvitation,
);
adminRouter.get("/dashboard/:slug", adminController.getDashboardStats);
adminRouter.get("/dashboard/:slug/export", adminController.exportGuestsAsExcel);
