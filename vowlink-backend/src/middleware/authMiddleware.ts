import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../config/authTokens";
import type { UserRole } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role: UserRole;
    invitationId?: string;
  };
}

export const requireAuth = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return response.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(token);
    request.user = {
      sub: payload.sub,
      role: payload.role,
      invitationId: payload.invitationId,
    };
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
};

export const requireRoles =
  (...roles: UserRole[]) =>
  (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: "Authentication required." });
    }
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ message: "Insufficient permissions." });
    }
    return next();
  };
