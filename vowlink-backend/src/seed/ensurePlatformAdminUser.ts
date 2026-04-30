import mongoose from "mongoose";
import { authService } from "../services/AuthService";
import { UserModel } from "../models/User";
import { inMemoryUserStore } from "../utilities/InMemoryUserStore";

export const ensurePlatformAdminUser = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — platform login disabled until configured.",
    );
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    // eslint-disable-next-line no-console
    console.warn("MongoDB not connected — seeding platform admin in-memory.");
    const passwordHash = await authService.hashPassword(password);
    inMemoryUserStore.seedPlatformAdmin({ email, passwordHash });
    return;
  }

  const existing = await UserModel.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Platform admin user already exists.");
    return;
  }

  const passwordHash = await authService.hashPassword(password);
  await UserModel.create({
    email,
    passwordHash,
    role: "PLATFORM_ADMIN",
  });

  // eslint-disable-next-line no-console
  console.log(`Platform admin created for ${email}.`);
};
