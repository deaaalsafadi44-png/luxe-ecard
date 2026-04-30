import { Router } from "express";
import { platformController } from "../controllers/PlatformController";
import { requireAuth, requireRoles } from "../middleware/authMiddleware";

export const platformRouter = Router();

platformRouter.use(requireAuth);
platformRouter.use(requireRoles("PLATFORM_ADMIN"));

platformRouter.get("/invitations", platformController.listInvitations);
platformRouter.patch("/invitations/:slug", platformController.updateInvitation);
platformRouter.delete("/invitations/:slug", platformController.deleteInvitation);
platformRouter.post("/couples", platformController.createCoupleAccount);
