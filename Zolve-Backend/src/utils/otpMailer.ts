import nodemailer from "nodemailer";
import * as models from "../models";

interface CompanySmtpSettings {
  MHost?: string | null;
  MPort?: number | string | null;
  Muser?: string | null;
  MCurrentPassword?: string | null;
  MFromEmail?: string | null;
  MMail?: string | null;
}

interface CompanySettingsModel {
  findOne(options: {
    where: Record<string, number>;
    attributes: string[];
    raw: true;
  }): Promise<CompanySmtpSettings | null>;
}

const getCompanySettingsModel = (): CompanySettingsModel | undefined => {
  const registry = models as unknown as { CompanySettings?: CompanySettingsModel };
  return registry.CompanySettings;
};

export async function sendEmailOTP(
  to: string,
  otp: string | number,
  unitId: number | null = null
): Promise<boolean> {
  try {
    const companySettingsModel = getCompanySettingsModel();

    const settings = companySettingsModel
      ? await companySettingsModel.findOne({
          where: unitId ? { Unitid: unitId } : { ID: 1 },
          attributes: ["MHost", "MPort", "Muser", "MCurrentPassword", "MFromEmail", "MMail"],
          raw: true,
        })
      : null;

    const cfg = {
      host: settings?.MHost || process.env.SMTP_HOST || "",
      port: Number(settings?.MPort || process.env.SMTP_PORT || 587),
      user: settings?.Muser || process.env.SMTP_USER || "",
      pass: settings?.MCurrentPassword || process.env.SMTP_PASS || "",
      from: settings?.MMail || settings?.MFromEmail || process.env.SMTP_FROM || "",
    };

    if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
      console.error("SMTP configuration is incomplete.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: cfg.from,
      to,
      subject: "Your HRMS OTP Code",
      html: `
        <div style="font-family:Arial, sans-serif;">
          <h3>Your One-Time Password (OTP)</h3>
          <p>Your login verification code is:</p>
          <h2 style="color:#2F67F6;">${otp}</h2>
          <p>This code will expire in 5 minutes.</p>
          <p>Do not share this OTP with anyone.</p>
          <br/>
          <small>This email was sent automatically by HRMS. Do not reply to this mail.</small>
        </div>
      `,
    });

    return true;
  } catch (err: unknown) {
    console.error("Error sending email OTP:", err);
    return false;
  }
}
