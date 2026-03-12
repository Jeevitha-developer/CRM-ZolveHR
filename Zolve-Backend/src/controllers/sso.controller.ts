import { Request, Response } from 'express';
import { verifySsoToken, signHrmsToken } from '../utils/hrmsJwt';
import { MasterEmployee } from '../models/MasterEmployee.model';
 
// ── POST /api/auth/sso ────────────────────────────────────────────────────────
// Called by HRMS frontend with sso_token received from CRM redirect

export const ssoLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sso_token } = req.body;

        if (!sso_token) {
            res.status(400).json({
                success: false,
                message: 'SSO token is required',
            });
            return;
        }

        // 1. Verify SSO token signed by CRM
        //    throws if expired (60s) or tampered
        const payload = verifySsoToken(sso_token);

        // 2. Find employee in HRMS DB using employeeEmail
        const employee = await MasterEmployee.findOne({
            where: {
                employeeEmail:    payload.email,
                Is_Employe_Active: 1,           // must be active
                Delflag:           0,            // not deleted
            },
            attributes: [
                'employeeId',
                'EmployeeNo',
                'FirstName',
                'LastName',
                'employeeEmail',
                'Unitid',
                'designationid',
                'Is_Employe_Active',
            ],
        });

        if (!employee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found in HRMS. Please contact your admin.',
            });
            return;
        }

        // 3. Issue HRMS JWT using existing signHrmsToken
        const hrms_token = signHrmsToken({
            emp_id:         employee.employeeId,
            employee_no:    employee.EmployeeNo,
            email:          employee.employeeEmail,
            role:           payload.role_name as any,
            client_id:      payload.client_id,
            hrms_db_name:   payload.hrms_db_name,
            hrms_tenant_id: payload.tenant_id,
            unit_id:        employee.Unitid,
        });

        res.status(200).json({
            success:     true,
            message:     'SSO login successful',
            hrms_token,
            employee: {
                id:          employee.employeeId,
                employee_no: employee.EmployeeNo,
                first_name:  employee.FirstName,
                last_name:   employee.LastName,
                email:       employee.employeeEmail,
                unit_id:     employee.Unitid,
                role:        payload.role_name,
            },
        });

    } catch (err: any) {
        // jwt.verify throws TokenExpiredError or JsonWebTokenError
        res.status(401).json({
            success: false,
            message: 'SSO token is invalid or expired. Please try again.',
        });
    }
};