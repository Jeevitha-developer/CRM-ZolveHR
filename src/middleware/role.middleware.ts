// src/middleware/role.middleware.ts
import { Response, NextFunction } from "express";
import { error }       from "../utils/response";
import { AuthRequest, UserRole } from "../types";

export const authorize = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      error(res, `Access denied. Required role: ${roles.join(" or ")}`, 403);
      return;
    }
    next();
  };
