import { Router } from "express";
import { rsvpController } from "../controllers/RsvpController";

export const rsvpRouter = Router();

rsvpRouter.patch("/:slug/:guestSlug", rsvpController.updateGuestAttendance);
