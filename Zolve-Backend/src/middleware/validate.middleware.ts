// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { error } from "../utils/response";

export const validateBody = (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((f) => !req.body[f]);
    if (missing.length > 0) {
      error(res, `Missing required fields: ${missing.join(", ")}`, 400);
      return;
    }
    next();
  };
