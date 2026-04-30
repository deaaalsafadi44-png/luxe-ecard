import dotenv from "dotenv";
import { app } from "./app";
import { connectMongoWithRetries } from "./config/database";
import { ensurePlatformAdminUser } from "./seed/ensurePlatformAdminUser";
import { ensureSampleDemoInvitation } from "./seed/ensureSampleDemoInvitation";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const bootstrapServer = async () => {
  await ensureSampleDemoInvitation();
  await ensurePlatformAdminUser();

  // Start MongoDB connection in background (dev), so the server remains usable
  // even when Atlas is unreachable.
  void connectMongoWithRetries(8, 4000).catch((databaseError) => {
    // eslint-disable-next-line no-console
    console.warn(
      "MongoDB connection failed (dev). Backend keeps running in degraded mode.",
      databaseError,
    );
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`VowLink backend is running on port ${port}`);
  });
};

bootstrapServer().catch((bootstrapError) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", bootstrapError);
  process.exit(1);
});
