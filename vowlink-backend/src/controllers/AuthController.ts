import type { Request, Response } from "express";
import { authService } from "../services/AuthService";

export const authController = {
  async login(request: Request, response: Response) {
    try {
      const email = String(request.body?.email ?? "");
      const password = String(request.body?.password ?? "");
      const result = await authService.login(email, password);
      return response.status(200).json(result);
    } catch (error) {
      return response.status(401).json({
        message: error instanceof Error ? error.message : "Login failed.",
      });
    }
  },
};
