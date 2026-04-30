import { Router } from "express";
import { couplePortalController } from "../controllers/CouplePortalController";
import { requireAuth, requireRoles } from "../middleware/authMiddleware";

export const couplePortalRouter = Router();

couplePortalRouter.use(requireAuth);
couplePortalRouter.use(requireRoles("COUPLE"));

couplePortalRouter.get("/invitation", couplePortalController.getMyInvitation);
couplePortalRouter.post("/invitation", couplePortalController.createMyInvitation);
couplePortalRouter.patch("/invitation", couplePortalController.updateMyInvitation);
couplePortalRouter.get("/guests", couplePortalController.listGuests);
couplePortalRouter.post("/guests", couplePortalController.addGuest);
couplePortalRouter.get("/rsvp", couplePortalController.getMyRsvpDashboard);
