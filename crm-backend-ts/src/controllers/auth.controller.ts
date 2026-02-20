// src/controllers/auth.controller.ts
import { Request, Response }    from "express";
import * as authService         from "../services/auth.service";
import { User }                 from "../models";
import { success, error }       from "../utils/response";
import { AuthRequest, RegisterBody, LoginBody, OtpBody } from "../types";

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
  try {
    await authService.storeOtp(req.body);
    success(res, {}, "OTP sent successfully. Check console in dev mode.");
  } catch (err: any) { error(res, err.message, 400); }
};

export const verifyOTP = async (req: Request<{}, {}, OtpBody>, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const stored = authService.getOtpEntry(email);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      error(res, "Invalid or expired OTP", 400); return;
    }
    const user = await authService.createUser(stored);
    authService.deleteOtp(email);
    success(res, { user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } }, "Account created successfully", 201);
  } catch (err: any) { error(res, err.message, 400); }
};

export const resendOtp = async (req: Request<{}, {}, { email: string }>, res: Response): Promise<void> => {
  try {
    authService.refreshOtp(req.body.email);
    success(res, {}, "New OTP sent successfully");
  } catch (err: any) { error(res, err.message, 400); }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    success(res, result, "Login successful");
  } catch (err: any) { error(res, err.message, 401); }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: ["id","email","first_name","last_name","mobile","role","is_active"],
    });
    if (!user) { error(res, "User not found", 404); return; }
    success(res, { user }, "User fetched");
  } catch (err: any) { error(res, err.message); }
};

export const logout = (_req: Request, res: Response): void => {
  success(res, {}, "Logged out successfully");
};
