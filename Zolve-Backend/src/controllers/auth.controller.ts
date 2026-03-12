// src/controllers/auth.controller.ts
import { Request, Response }    from "express";
import * as authService         from "../services/auth.service";
import { Register }       from "../models";
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
    success(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role } }, "Account created successfully", 201);
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
    const user = await Register.findByPk(req.user!.id, {
      attributes: ["id", "name", "email", "EmployeeNo", "Mobile", "role"],
    });
    if (!user) { error(res, "User not found", 404); return; }
    success(res, { user }, "User fetched");
  } catch (err: any) { error(res, err.message); }
};

export const logout = (_req: Request, res: Response): void => {
  success(res, {}, "Logged out successfully");
};

export const masterRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await authService.createMasterRegister(req.body);
    success(res, result, "User created successfully");
  } catch (err: any) {
    error(res, err.message || "Email already exists ...", authService.getStatusCode(err));
  }
};

export const masterWorkerRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.createMasterWorkerRegister(req.body);
    success(res, result, "Worker registered successfully");
  } catch (err: any) {
    error(res, err.message || "Worker registration failed.", authService.getStatusCode(err));
  }
};

export const masterRegisterForLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = await authService.createMasterRegisterForLink(req.body);
    success(res, { token }, "User registered successfully");
  } catch (err: any) {
    error(res, err.message || "Internal Server Error", authService.getStatusCode(err));
  }
};

export const getAllMasterRegister = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await authService.listMasterRegister();
    success(res, { users }, "Users fetched successfully");
  } catch (err: any) {
    error(res, err.message || "Failed to fetch users", authService.getStatusCode(err));
  }
};

export const masterUpdateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.updateMasterUserRole(Number(req.params.id), req.body.role);
    success(res, {}, "updated userRole successfully");
  } catch (err: any) {
    error(res, err.message || "Failed to update UserRole", authService.getStatusCode(err));
  }
};

export const updateEmployeeNoIfMatched = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.updateEmployeeNoIfMatched(req.body);
    success(res, {}, "EmployeeNo and password updated successfully");
  } catch (err: any) {
    error(res, err.message || "Internal Server Error", authService.getStatusCode(err));
  }
};

export const masterLoginUser = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const token = await authService.masterLoginUser(req.body);
    success(res, { token }, "Login successful");
  } catch (err: any) {
    error(res, err.message || "Failed to login user", authService.getStatusCode(err));
  }
};

export const masterLoginRegisterLinkUser = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const token = await authService.masterLoginRegisterLinkUser(req.body);
    success(res, { token }, "Login successful");
  } catch (err: any) {
    error(res, err.message || "Failed to login user", authService.getStatusCode(err));
  }
};

export const masterUsersId = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await authService.getMasterUserByEmployeeNo(req.params.id);
    success(res, { user }, "User fetched");
  } catch (err: any) {
    error(res, err.message || "Internal Server Error", authService.getStatusCode(err));
  }
};

export const masterForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.masterForgotPassword(req.body);
    success(res, {}, "Password reset email sent");
  } catch (err: any) {
    error(res, err.message || "Internal Server Error", authService.getStatusCode(err));
  }
};

export const masterResetPassword = async (
  req: Request<{ token: string }, {}, { password: string }>,
  res: Response
): Promise<void> => {
  try {
    await authService.masterResetPassword(req.params.token, req.body.password);
    success(res, {}, "Password reset successfully");
  } catch (err: any) {
    error(res, err.message || "Internal Server Error", authService.getStatusCode(err));
  }
};

export const masterGetAllEmployeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await authService.getAllMasterEmployeeData(req.query as Record<string, string>);
    success(res, { employees }, "Employees fetched");
  } catch (err: any) {
    error(res, err.message || "Failed to fetch users", authService.getStatusCode(err));
  }
};

export const getEmployeeByEmail = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const employees = await authService.getMasterEmployeeByEmail(req.params.email);
    success(res, { employees }, "Employee fetched");
  } catch (err: any) {
    error(res, err.message || "Failed to fetch employee", authService.getStatusCode(err));
  }
};
