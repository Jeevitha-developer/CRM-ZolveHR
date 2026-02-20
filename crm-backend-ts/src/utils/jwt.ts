// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import env  from "../config/env";
import { JwtPayload } from "../types";

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
