// src/services/auth.service.ts
import bcrypt           from "bcryptjs";
import axios            from "axios";
import crypto           from "crypto";
import jwt              from "jsonwebtoken";
import nodemailer       from "nodemailer";
import { Op, WhereOptions } from "sequelize";
import { signToken }    from "../utils/jwt";
import { CompanySettings, MasterEmployee, Register } from "../models";
import { RegisterBody, LoginBody, JwtPayload } from "../types";
import { comparePassword, hashPassword } from "../utils/passwordUtils";
import { createJWT } from "../utils/tokenUtils";

interface OtpEntry extends RegisterBody { otp: string; expires: number; }
type UserRole = "admin" | "manager" | "user";

class ServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map<string, OtpEntry>();

export const storeOtp = async (body: RegisterBody): Promise<void> => {
  const exists = await Register.findOne({ where: { email: body.email } });
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

export const createUser = async (data: RegisterBody): Promise<Register> => {
  const hashed = await bcrypt.hash(data.password, 10);
  return Register.create({
    name: `${data.first_name} ${data.last_name}`.trim(),
    email: data.email,
    password: hashed,
    role: data.role ?? "user",
    Mobile: Number(data.mobile) || undefined,
  });
};

export const loginUser = async (data: LoginBody): Promise<{ token: string; user: Partial<Register> }> => {
  const user = await Register.findOne({ where: { email: data.email } });
  if (!user) throw new Error("Invalid email or password");
  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error("Invalid email or password");
  const payload: JwtPayload = { id: user.id, email: user.email, role: (user.role ?? "user") as JwtPayload["role"] };
  return {
    token: signToken(payload),
    user:  { id: user.id, email: user.email, name: user.name, Mobile: user.Mobile, role: user.role },
  };
};

interface MasterRegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  EmployeeNo?: string;
  Mobile?: number;
}

interface MasterWorkerRegisterPayload {
  name: string;
  password: string;
  role?: string;
  Mobile: number;
}

interface MasterRegisterForLinkPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface UpdateEmployeeNoPayload {
  employeeNo: string;
  Password: string;
  id: number;
  name?: string;
  Category?: string | number;
  Mobile?: number;
  Gender?: string | number;
  unitId?: number;
}

interface MasterForgotPasswordPayload {
  email: string;
  CompanyEmail: string;
  CompanyPassword: string;
  CompanyEmailHost: string;
  CompanyEmailPort: number;
  CompanyLable: string;
}

interface MasterEmployeeFilters {
  page?: number | string;
  limit?: number | string;
  [key: string]: string | number | undefined;
}

const asRole = (role?: string): UserRole => {
  if (role === "admin" || role === "manager" || role === "user") return role;
  return "user";
};

const jwtSecret = process.env.JWT_SECRET || "dev-secret";

export const createMasterRegister = async (data: MasterRegisterPayload): Promise<{ userId: number; token: string }> => {
  const { name, email, password, role, EmployeeNo, Mobile } = data;
  if (!name || !email || !password) throw new ServiceError(400, "Some Field has empty ...");

  const exists = await Register.findOne({ where: { email } });
  if (exists) throw new ServiceError(400, "Email already exists ...");

  const hashedPassword = await hashPassword(password);
  const user = await Register.create({
    name,
    email,
    password: hashedPassword,
    role: asRole(role),
    EmployeeNo,
    Mobile,
  });
  return { userId: user.id, token: createJWT({ userId: user.id }) };
};

export const createMasterWorkerRegister = async (data: MasterWorkerRegisterPayload): Promise<{ userId: number; token: string }> => {
  const { name, password, role, Mobile } = data;
  if (!name || !password || !Mobile) throw new ServiceError(400, "Required fields missing.");

  const hashedPassword = await hashPassword(password);
  const user = await Register.create({
    name,
    email: `${Date.now()}_${Mobile}@worker.local`,
    password: hashedPassword,
    role: asRole(role),
    Mobile,
  });
  return { userId: user.id, token: createJWT({ userId: user.id }) };
};

export const createMasterRegisterForLink = async (data: MasterRegisterForLinkPayload): Promise<string> => {
  const { name, email, password, role } = data;
  if (!name || !email || !password) throw new ServiceError(400, "Some Field has empty ...");

  const exists = await Register.findOne({ where: { email } });
  if (exists) throw new ServiceError(400, "Email already exists ...");

  const hashedPassword = await hashPassword(password);
  const user = await Register.create({
    name,
    email,
    password: hashedPassword,
    role: asRole(role),
  });
  return createJWT({ userId: user.id });
};

export const listMasterRegister = async (): Promise<Register[]> =>
  Register.findAll({ order: [["id", "DESC"]] });

export const updateMasterUserRole = async (id: number, role: string): Promise<void> => {
  const user = await Register.findByPk(id);
  if (!user) throw new ServiceError(404, "User not found");
  await user.update({ role: asRole(role) });
};

export const updateEmployeeNoIfMatched = async (data: UpdateEmployeeNoPayload): Promise<void> => {
  const { employeeNo, Password, id, name, Category, Mobile, Gender, unitId } = data;
  if (!employeeNo || !Password || !id) throw new ServiceError(400, "employeeNo, Password and id are required");

  const employee = await MasterEmployee.findOne({
    where: { employeeId: id },
    attributes: ["RegisterId", "Unitid"],
  });

  if (!employee || !employee.RegisterId) throw new ServiceError(404, "User not found in register");

  const effectiveUnitId = unitId ?? employee.Unitid ?? undefined;
  let newEmployeeNo = employeeNo;

  if (effectiveUnitId) {
    const settings = await CompanySettings.findOne({
      where: { Unitid: effectiveUnitId },
      attributes: ["Prefix"],
    });
    const prefix = settings?.getDataValue("Prefix") as string | null | undefined;
    if (prefix) newEmployeeNo = `${prefix}${employeeNo}`;
  }

  if (process.env.CANTEEN_USERNAME) {
    try {
      const tokenResponse = await axios.post(
        "https://akrqadapi.pgmsoftsolution.com/AKRCafeApi/api/Gettoken",
        { Username: process.env.CANTEEN_USERNAME, EmailAddress: process.env.CANTEEN_USERNAME }
      );
      const token = tokenResponse?.data?.token as string | undefined;
      if (token) {
        await axios.post(
          "https://akrqadapi.pgmsoftsolution.com/AKRCafeApi/api/AKRPayrollEmployeeCreate",
          {
            AEmpno: newEmployeeNo,
            Employeename: name,
            EmpCategory: Category,
            Gender,
            PhoneNo: Mobile,
            CompanyUnitid: effectiveUnitId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (_err) {
      // Non-blocking external sync.
    }
  }

  const hashed = await hashPassword(Password);
  await Register.update(
    { EmployeeNo: employeeNo, password: hashed },
    { where: { id: employee.RegisterId } }
  );
};

export const masterLoginUser = async (data: LoginBody): Promise<string> => {
  const { email, password } = data;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const where = isEmail ? { email } : { EmployeeNo: email };
  const user = await Register.findOne({ where });
  if (!user) throw new ServiceError(401, "Invalid Employee ID or Email");

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new ServiceError(401, "Invalid credentials");

  if (!isEmail && user.email) {
    await Register.update(
      { EmployeeNo: email },
      { where: { email: user.email, EmployeeNo: { [Op.is]: null } } }
    );
  }

  return jwt.sign(
    { userId: user.EmployeeNo || user.id, employeeId: user.id },
    jwtSecret,
    { expiresIn: "120h" }
  );
};

export const masterLoginRegisterLinkUser = async (data: LoginBody): Promise<string> => {
  const { email } = data;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const where: WhereOptions = isEmail
    ? { employeeEmail: email }
    : { employeeMobile: Number(email) || 0 };

  const user = await MasterEmployee.findOne({ where });
  if (!user) throw new ServiceError(404, "User not found");
  if (user.IsApplicationSubmited === 1) {
    throw new ServiceError(403, "Form already submitted. Login not allowed.");
  }

  return jwt.sign(
    { userId: user.employeeId, email: user.employeeEmail || "" },
    jwtSecret,
    { expiresIn: "1h" }
  );
};

export const getMasterUserByEmployeeNo = async (employeeNo: string): Promise<Register> => {
  const user = await Register.findOne({ where: { EmployeeNo: employeeNo } });
  if (!user) throw new ServiceError(404, "User not found");
  return user;
};

export const masterForgotPassword = async (data: MasterForgotPasswordPayload): Promise<void> => {
  const {
    email,
    CompanyEmail,
    CompanyPassword,
    CompanyEmailHost,
    CompanyEmailPort,
    CompanyLable,
  } = data;

  const user = await Register.findOne({ where: { email } });
  if (!user) throw new ServiceError(404, "Email not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.update({ reset_token: resetToken, reset_token_expiry: resetTokenExpiry });

  const transporter = nodemailer.createTransport({
    host: CompanyEmailHost,
    port: Number(CompanyEmailPort),
    secure: Number(CompanyEmailPort) === 465,
    auth: { user: CompanyEmail, pass: CompanyPassword },
  });

  await transporter.sendMail({
    from: `"${CompanyLable}" <${CompanyEmail}>`,
    to: email,
    subject: "Password Reset",
    html: `<p>You requested a password reset. Click <a href="https://app.zolvehr.com/reset-password/${resetToken}">here</a> to reset your password. This link is valid for one hour.</p>`,
  });
};

export const masterResetPassword = async (token: string, password: string): Promise<void> => {
  if (!token || !password) throw new ServiceError(400, "Token and password are required");
  const user = await Register.findOne({
    where: {
      reset_token: token,
      reset_token_expiry: { [Op.gt]: new Date() },
    },
  });
  if (!user) throw new ServiceError(400, "Invalid or expired token");
  const hashed = await hashPassword(password);
  await user.update({ password: hashed, reset_token: null, reset_token_expiry: null });
};

export const getAllMasterEmployeeData = async (query: MasterEmployeeFilters): Promise<MasterEmployee[]> => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.max(1, Number(query.limit || 50));
  const offset = (page - 1) * limit;
  const where: WhereOptions = {};

  for (const [key, value] of Object.entries(query)) {
    if (["page", "limit"].includes(key) || value === undefined || value === "") continue;
    const mappedKey = key === "Gender" ? "gender" : key;
    if (mappedKey === "gender") {
      const genderValue = String(value).toLowerCase();
      where[mappedKey] = { [Op.like]: `%${genderValue}%` };
      continue;
    }
    where[mappedKey] = { [Op.like]: `%${String(value)}%` };
  }

  return MasterEmployee.findAll({
    where,
    limit,
    offset,
    order: [["employeeId", "ASC"]],
  });
};

export const getMasterEmployeeByEmail = async (email: string): Promise<MasterEmployee[]> => {
  const rows = await MasterEmployee.findAll({ where: { employeeEmail: email } });
  if (!rows.length) throw new ServiceError(404, "Employee not found");
  return rows;
};

export const getStatusCode = (err: unknown): number => {
  if (err instanceof ServiceError) return err.statusCode;
  return 500;
};
