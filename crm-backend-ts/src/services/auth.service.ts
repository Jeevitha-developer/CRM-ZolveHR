// src/services/auth.service.ts
import bcrypt           from "bcryptjs";
import { signToken }    from "../utils/jwt";
import { User }         from "../models";
import { RegisterBody, LoginBody, JwtPayload } from "../types";

interface OtpEntry extends RegisterBody { otp: string; expires: number; }

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map<string, OtpEntry>();

export const storeOtp = async (body: RegisterBody): Promise<void> => {
  const exists = await User.findOne({ where: { email: body.email } });
  if (exists) throw new Error("An account with this email already exists");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(body.email, { ...body, otp, expires: Date.now() + 5 * 60 * 1000 });
  console.log(`[DEV] OTP for ${body.email}: ${otp}`);
};

export const getOtpEntry = (email: string): OtpEntry | undefined =>
  otpStore.get(email);

export const deleteOtp = (email: string): void => { otpStore.delete(email); };

export const refreshOtp = (email: string): void => {
  const stored = otpStore.get(email);
  if (!stored) throw new Error("No pending registration found for this email");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { ...stored, otp, expires: Date.now() + 5 * 60 * 1000 });
  console.log(`[DEV] New OTP for ${email}: ${otp}`);
};

export const createUser = async (data: RegisterBody): Promise<User> => {
  const hashed = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password: hashed, role: data.role ?? "user" });
};

export const loginUser = async (data: LoginBody): Promise<{ token: string; user: Partial<User> }> => {
  const user = await User.findOne({ where: { email: data.email } });
  if (!user) throw new Error("Invalid email or password");
  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error("Invalid email or password");
  if (!user.is_active) throw new Error("Your account has been deactivated. Contact admin.");
  await user.update({ last_login: new Date() });
  const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
  return {
    token: signToken(payload),
    user:  { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, mobile: user.mobile, role: user.role },
  };
};
