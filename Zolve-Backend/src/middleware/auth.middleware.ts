import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { error }       from "../utils/response";
import { AuthRequest } from "../types";

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      error(res, "Access denied. No token provided.", 401);
      return;
    }
    req.user = verifyToken(header.split(" ")[1]);
    next();
  } catch {
    error(res, "Invalid or expired token. Please login again.", 401);
  }
};
