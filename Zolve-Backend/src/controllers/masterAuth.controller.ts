import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { hashPassword } from '../utils/passwordUtils';
import { createJWT } from '../utils/tokenUtils';
import { getTenantDB } from '../config/tenantconnection';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterBody {
  name: string;
  email?: string;
  password: string;
  role?: string;
  EmployeeNo?: string | null;
  Mobile?: string | null;
}

interface LoginBody {
  email: string;
  password: string;
  tenant_id?: string;
}

interface ForgotPasswordBody {
  email: string;
  CompanyEmail: string;
  CompanyPassword: string;
  CompanyEmailHost: string;
  CompanyEmailPort: number;
  CompanyLable: string;
  CompanyName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getDb = (req: Request) => (req as any).db || sequelize;

// ── MasterRegister ────────────────────────────────────────────────────────────

export const MasterRegister = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, EmployeeNo = null, Mobile = null }: RegisterBody = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Some Field has empty ...' });
    return;
  }

  try {
    const hashedPassword = await hashPassword(password);
    const db = getDb(req);

    const [response]: any = await db.query(
      `INSERT INTO register (name, email, password, role, EmployeeNo, Mobile)
       VALUES (:name, :email, :password, :role, :EmployeeNo, :Mobile)`,
      {
        replacements: {
          name, email, password: hashedPassword,
          role: role || 'user',
          EmployeeNo: EmployeeNo || null,
          Mobile: Mobile || null,
        },
      }
    );

    const userId: number = response.insertId;
    const token = createJWT({ userId });

    // Auto-sync to masteremployee
    try {
      await db.query(
        `INSERT INTO masteremployee (
          FirstName, LastName, employeeEmail, EmployeeNo, employeeMobile,
          Unitid, dateOfJoining, Is_Employe_Active, Employee_Verified,
          IsApplicationSubmited, Delflag, RegisterId, Entrydate, gender
        ) VALUES (
          :name, '', :email, :employeeNo, :mobile, 1, CURDATE(), 1,
          0, 0, 0, :registerId, NOW(), ''
        )`,
        {
          replacements: {
            name, email,
            employeeNo: EmployeeNo || `EMP${userId}`,
            mobile: Mobile || 0,
            registerId: userId,
          },
        }
      );
      console.log(`[MasterRegister] ✅ Synced to masteremployee for: ${email}`);
    } catch (syncErr: any) {
      console.warn('[MasterRegister] masteremployee sync failed:', syncErr.message);
    }

    res.status(200).json(userId);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Email already exists ...' });
  }
};

// ── MasterWorkerRegister ──────────────────────────────────────────────────────

export const MasterWorkerRegister = async (req: Request, res: Response): Promise<void> => {
  const { name, password, role, Mobile } = req.body;

  if (!name || !Mobile || !password) {
    res.status(400).json({ error: 'Required fields missing.' });
    return;
  }

  try {
    const hashedPassword = await hashPassword(password);

    const [response]: any = await getDb(req).query(
      `INSERT INTO register (name, password, role, Mobile) VALUES (:name, :password, :role, :Mobile)`,
      { replacements: { name, password: hashedPassword, role, Mobile } }
    );

    const userId: number = response.insertId;
    createJWT({ userId });

    res.status(200).json(userId);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: 'Worker registration failed.' });
  }
};

// ── MasterRegisterForLink ─────────────────────────────────────────────────────

export const MasterRegisterForLink = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = 'user' }: RegisterBody = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Some Field has empty ...' });
    return;
  }

  try {
    const db = getDb(req);

    const existingUser = await db.query(
      'SELECT id FROM register WHERE email = :email',
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    if ((existingUser as any[]).length > 0) {
      res.status(400).json({ error: 'Email already exists ...' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const [response]: any = await db.query(
      `INSERT INTO register (name, email, password, role) VALUES (:name, :email, :password, :role)`,
      { replacements: { name, email, password: hashedPassword, role } }
    );

    const userId: number = response.insertId;
    const token = createJWT({ userId });

    // Auto-sync to masteremployee
    try {
      await db.query(
        `INSERT INTO masteremployee (
          FirstName, LastName, employeeEmail, EmployeeNo, employeeMobile,
          Unitid, dateOfJoining, Is_Employe_Active, Employee_Verified,
          IsApplicationSubmited, Delflag, RegisterId, Entrydate, gender
        ) VALUES (
          :name, '', :email, :employeeNo, 0, 1, CURDATE(), 1,
          0, 0, 0, :registerId, NOW(), ''
        )`,
        {
          replacements: {
            name, email,
            employeeNo: `EMP${userId}`,
            registerId: userId,
          },
        }
      );
      console.log(`[MasterRegisterForLink] ✅ Synced to masteremployee for: ${email}`);
    } catch (syncErr: any) {
      console.warn('[MasterRegisterForLink] masteremployee sync failed:', syncErr.message);
    }

    res.status(200).json({ message: 'User registered successfully', token });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ── getAllMasterRegister ───────────────────────────────────────────────────────

export const getAllMasterRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await getDb(req).query(
      'SELECT * FROM register',
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ── MasterupdateUser ──────────────────────────────────────────────────────────

export const MasterupdateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const response = await getDb(req).query(
      'UPDATE register SET role = :role WHERE id = :id',
      { replacements: { role, id } }
    );
    res.status(200).json({ message: 'updated userRole successfully', response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update UserRole' });
  }
};

// ── updateEmployeeNoIfMatched ─────────────────────────────────────────────────

export const updateEmployeeNoIfMatched = async (req: Request, res: Response): Promise<void> => {
  const { employeeNo, Password, id, name, Category, Mobile, Gender, unitId } = req.body;

  try {
    const db = getDb(req);

    const user = await db.query(
      'SELECT RegisterId FROM foremployee_master WHERE employeeId = :id',
      { replacements: { id }, type: QueryTypes.SELECT }
    ) as any[];

    if (!user.length) {
      res.status(404).json({ message: 'User not found in register' });
      return;
    }

    const RegisterId = user[0]?.RegisterId;

    const prefix = await db.query(
      'SELECT EmpNumPrefix FROM companysettings WHERE Unitid = :unitId',
      { replacements: { unitId }, type: QueryTypes.SELECT }
    ) as any[];

    const prefixName = prefix[0]?.EmpNumPrefix || null;
    const NewemployeeNo = prefixName ? `${prefixName}${employeeNo}` : employeeNo;

    // Canteen API sync (non-fatal)
    try {
      const tokenResponse = await axios.post(
        'https://akrqadapi.pgmsoftsolution.com/AKRCafeApi/api/Gettoken',
        {
          Username: process.env.CANTEEN_USERNAME,
          EmailAddress: process.env.CANTEEN_USERNAME,
        }
      );
      const token = tokenResponse?.data?.token;

      if (token) {
        const CanteenResponse = await axios.post(
          'https://akrqadapi.pgmsoftsolution.com/AKRCafeApi/api/AKRPayrollEmployeeCreate',
          { AEmpno: NewemployeeNo, Employeename: name, EmpCategory: Category, Gender, PhoneNo: Mobile, CompanyUnitid: unitId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('deduction', CanteenResponse.data);
      }
    } catch (err: any) {
      console.error('Error adding employee data:', err.message);
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    await db.query(
      'UPDATE register SET EmployeeNo = :empNo, password = :password WHERE id = :id',
      { replacements: { empNo: employeeNo, password: hashedPassword, id: RegisterId } }
    );

    res.status(200).json({ message: 'EmployeeNo and password updated successfully' });
  } catch (error: any) {
    console.error('Failed to update EmployeeNo:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── MasterloginUser ───────────────────────────────────────────────────────────

export const MasterloginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, tenant_id }: LoginBody = req.body;

  console.log('========================================');
  console.log('[MasterLogin] ▶ New login attempt');
  console.log('[MasterLogin] email     :', email);
  console.log('[MasterLogin] tenant_id :', tenant_id);
  console.log('========================================');

  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Step 1: Resolve DB name
    let dbName: string | undefined;

    if (tenant_id) {
      dbName = tenant_id.replace(/^tenant_/, 'hrms_');
      console.log('[MasterLogin] ✅ DB from tenant_id:', dbName);
    } else {
      console.log('[MasterLogin] No tenant_id — asking CRM for:', email);
      const crmRes = await axios.get(
        `${process.env.CRM_URL}/api/clients/client-by-email`,
        { params: { email } }
      );
      dbName = crmRes.data?.db_name || crmRes.data?.hrms_db_name;
      console.log('[MasterLogin] DB from CRM:', dbName);
    }

    if (!dbName) {
      res.status(404).json({ error: 'Tenant DB not found for this user' });
      return;
    }

    // Step 2: Connect tenant DB
    const tenantDb = getTenantDB(dbName);

    // Step 3: Find user
    const query = isEmail
      ? 'SELECT * FROM register WHERE email = :param'
      : 'SELECT * FROM register WHERE EmployeeNo = :param';

    const rows = await tenantDb.query(query, {
      replacements: { param: email },
      type: QueryTypes.SELECT,
    }) as any[];

    console.log('[MasterLogin] Matched rows count:', rows.length);

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid Employee ID or Email' });
      return;
    }

    const user = rows[0];
    console.log('[MasterLogin] Found user EmployeeNo:', user.EmployeeNo);
    console.log('[MasterLogin] Found user role      :', user.role);

    // Step 4: Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[MasterLogin] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Step 5: Update EmployeeNo if needed
    if (!isEmail && user.email && !user.EmployeeNo) {
      await tenantDb.query(
        'UPDATE register SET EmployeeNo = :empNo WHERE email = :email AND EmployeeNo IS NULL',
        { replacements: { empNo: email, email: user.email }, type: QueryTypes.UPDATE }
      );
      console.log('[MasterLogin] EmployeeNo updated for:', user.email);
    }

    // Step 6: Generate JWT
    const token = jwt.sign(
      {
        userId:     user.id,
        employeeId: user.id,
        employeeNo: user.EmployeeNo,
        tenant_db:  dbName,
        role:       user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '120h' }
    );

    console.log('[MasterLogin] ✅ Login successful for:', email);
    console.log('========================================');

    res.status(200).json({ token, tenant_db: dbName });
  } catch (error: any) {
    console.error('[MasterLogin] ❌ Exception:', error.message);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

// ── MasterloginRegisterLinkUser ───────────────────────────────────────────────

export const MasterloginRegisterLinkUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const query = isEmail
      ? 'SELECT * FROM foremployee_master WHERE employeeEmail = ?'
      : 'SELECT * FROM foremployee_master WHERE employeeMobile = ?';

    const [rows]: any = await getDb(req).query(query, [email]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = rows[0];

    if (user.IsApplicationSubmited === 1) {
      res.status(403).json({ error: 'Form already submitted. Login not allowed.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    console.log('✅ Login successful, sending token.');
    res.status(200).json({ token });
  } catch (error: any) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

// ── Masterlogout ──────────────────────────────────────────────────────────────

export const Masterlogout = (req: Request, res: Response): void => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ msg: 'user logged out!' });
};

// ── MasterusersId ─────────────────────────────────────────────────────────────

export const MasterusersId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows]: any = await (req as any).db.query(
      'SELECT * FROM register WHERE id = ? OR EmployeeNo = ?',
      [id, id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── MasterforgotPassword ──────────────────────────────────────────────────────

export const MasterforgotPassword = async (req: Request, res: Response): Promise<void> => {
  const {
    email, CompanyEmail, CompanyPassword,
    CompanyEmailHost, CompanyEmailPort, CompanyLable,
  }: ForgotPasswordBody = req.body;

  try {
    const [userRows]: any = await getDb(req).query(
      'SELECT * FROM register WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedExpiry = `${resetTokenExpiry.getFullYear()}-${pad(resetTokenExpiry.getMonth() + 1)}-${pad(resetTokenExpiry.getDate())} ${pad(resetTokenExpiry.getHours())}:${pad(resetTokenExpiry.getMinutes())}:${pad(resetTokenExpiry.getSeconds())}`;

    await getDb(req).query(
      'UPDATE register SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, formattedExpiry, email]
    );

    const resetUrl = `https://app.zolvehr.com/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: CompanyEmailHost,
      port: CompanyEmailPort,
      secure: CompanyEmailPort == 465,
      auth: { user: CompanyEmail, pass: CompanyPassword },
    });

    await transporter.sendMail({
      from: `"${CompanyLable}" <${CompanyEmail}>`,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for one hour.</p>`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ── MasterResetPassword ───────────────────────────────────────────────────────

export const MasterResetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: 'Token and password are required' });
    return;
  }

  try {
    const [userRows]: any = await getDb(req).query(
      'SELECT * FROM register WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (userRows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = userRows[0];
    const hashedPassword = await hashPassword(password);

    await getDb(req).query(
      'UPDATE register SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ── MasterGetAllEmployeeData ──────────────────────────────────────────────────

export const MasterGetAllEmployeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, ...filters } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let searchQuery = 'WHERE 1=1';
    const searchParams: any[] = [];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        if (key === 'Gender') {
          const genderValue = (filters[key] as string).toLowerCase();
          if (genderValue === 'male') {
            searchQuery += ` AND ${key} = ?`;
            searchParams.push(1);
          } else if (genderValue === 'female') {
            searchQuery += ` AND ${key} = ?`;
            searchParams.push(0);
          }
        } else {
          searchQuery += ` AND ${key} LIKE ?`;
          searchParams.push(`%${filters[key]}%`);
        }
      }
    });

    const dataQuery = `
      SELECT * FROM foremployee_master
      ${searchQuery}
      ORDER BY Employeename ASC
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await getDb(req).query(dataQuery, [
      ...searchParams,
      parseInt(String(limit)),
      parseInt(String(offset)),
    ]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ── getEmployeeByEmail ────────────────────────────────────────────────────────

export const getEmployeeByEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  try {
    const [rows]: any = await getDb(req).query(
      'SELECT * FROM foremployee_master WHERE employeeEmail = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.status(200).json(rows);
  } catch (error: any) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};