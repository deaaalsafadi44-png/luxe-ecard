import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { isMongoConnected } from "./config/database";
import { adminRouter } from "./routes/adminRoutes";
import { authRouter } from "./routes/authRoutes";
import { couplePortalRouter } from "./routes/couplePortalRoutes";
import { invitationRouter } from "./routes/invitationRoutes";
import { platformRouter } from "./routes/platformRoutes";
import { rsvpRouter } from "./routes/rsvpRoutes";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

const healthPayload = () => ({
  status: "ok" as const,
  database: {
    connected: isMongoConnected(),
  },
});

app.get("/health", (_request, response) => {
  response.status(200).json(healthPayload());
});

/** Same payload as `/health` — Next.js rewrites `/api/*` to the backend, so this path works behind the dev proxy. */
app.get("/api/health", (_request, response) => {
  response.status(200).json(healthPayload());
});

app.use("/api/auth", authRouter);
app.use("/api/platform", platformRouter);
app.use("/api/couple", couplePortalRouter);
app.use("/api/invitations", invitationRouter);
app.use("/api/rsvp", rsvpRouter);
app.use("/api/admin", adminRouter);
