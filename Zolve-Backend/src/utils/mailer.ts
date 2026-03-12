// src/utils/mailer.ts
import nodemailer from "nodemailer";
import env        from "../config/env";

const transporter = nodemailer.createTransport({
  host:   env.MAIL_HOST,
  port:   env.MAIL_PORT,
  secure: false,
  auth:   { user: env.MAIL_USER, pass: env.MAIL_PASS },
});

interface MailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export const sendMail = async (opts: MailOptions): Promise<void> => {
  await transporter.sendMail({ from: env.MAIL_FROM, ...opts });
};

interface HrmsCredentialsPayload {
  to:           string;
  company_name: string;
  login_url:    string;
  email:        string;
  temp_password:string;
  plan:         string;
  valid_until:  string;
}

export const sendHrmsCredentials = async (p: HrmsCredentialsPayload): Promise<void> => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#6366f1">Your HRMS Account is Ready! 🎉</h2>
      <p>Hello, your HRMS account for <strong>${p.company_name}</strong> has been activated.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;color:#6b7280">Plan</td>        <td style="padding:8px;font-weight:bold">${p.plan}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Valid Until</td> <td style="padding:8px;font-weight:bold">${p.valid_until}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Login URL</td>   <td style="padding:8px"><a href="${p.login_url}">${p.login_url}</a></td></tr>
        <tr><td style="padding:8px;color:#6b7280">Email</td>       <td style="padding:8px;font-weight:bold">${p.email}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Password</td>    <td style="padding:8px;font-weight:bold">${p.temp_password}</td></tr>
      </table>
      <p style="color:#ef4444">Please change your password after first login.</p>
      <p style="color:#6b7280;font-size:12px">This is an automated email from CRM HRMS.</p>
    </div>`;
  await sendMail({ to: p.to, subject: `Your HRMS Account is Ready — ${p.company_name}`, html });
};
