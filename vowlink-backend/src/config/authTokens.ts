import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  invitationId?: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  if (process.env.NODE_ENV !== "production") {
    return "vowlink-dev-jwt-secret-min-16-chars";
  }
  throw new Error(
    "JWT_SECRET must be set in .env (at least 16 characters) for production.",
  );
};

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
