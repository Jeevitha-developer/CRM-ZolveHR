import jwt, { SignOptions } from 'jsonwebtoken';
import { HrmsJwtPayload } from '../types/hrms.types';

const HRMS_JWT_SECRET  = process.env.HRMS_JWT_SECRET  || 'hrms_super_secret_key';
const HRMS_JWT_EXPIRES = process.env.HRMS_JWT_EXPIRES || '8h';

// ✅ Same secret as CRM
const SSO_SECRET = process.env.HRMS_INTERNAL_SECRET!;

export interface SsoTokenPayload {
    user_id:      number;
    email:        string;
    role_id:      number;
    role_name:    string;
    client_id:    number;
    tenant_id:    string;
    hrms_db_name: string;
}

// Existing — unchanged
export const signHrmsToken = (payload: HrmsJwtPayload): string =>
    jwt.sign(payload, HRMS_JWT_SECRET, { expiresIn: HRMS_JWT_EXPIRES } as SignOptions);

export const verifyHrmsToken = (token: string): HrmsJwtPayload =>
    jwt.verify(token, HRMS_JWT_SECRET) as HrmsJwtPayload;

// ✅ New — validate SSO token from CRM
export const verifySsoToken = (token: string): SsoTokenPayload => {
    try {
        return jwt.verify(token, SSO_SECRET) as SsoTokenPayload;
    } catch {
        throw new Error('SSO token is invalid or expired. Please try again.');
    }
};