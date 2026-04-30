import { Router } from "express";
import { invitationController } from "../controllers/InvitationController";

export const invitationRouter = Router();

invitationRouter.get("/:slug", invitationController.getInvitationBySlug);
