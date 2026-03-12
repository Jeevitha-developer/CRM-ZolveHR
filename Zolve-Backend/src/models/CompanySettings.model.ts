import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CompanySettingsAttributes {
  ID: number;
  EntryDate?: Date | null;
  Unitid?: number | null;
  Logo?: string | null;
  DigitalSignature?: string | null;
  CompanyStartTime?: string | null;
  CompanyEndTime?: string | null;
  Weekstart?: number | null;
  WeekendDays?: number | null;
  Monthstart?: number | null;
  MonthEnd?: number | null;
  CalendarWeekStart?: number | null;
  CalendarWeekend?: number | null;
  ForthNightStart?: number | null;
  ForthNightEnd?: number | null;
  YearStart?: number | null;
  YearEnd?: number | null;
  PortalStartTime?: string | null;
  PortalEndTime?: string | null;
  leave_shift?: number | null;
  LeaveType?: string | null;
  LeaveCredits?: number | null;
  CarryEL?: number | null;
  EarnedLeavePayable?: number | null;
  OndutyPayable?: number | null;
  PermissionCount?: number | null;
  PermissionType?: string | null;
  MinutesPerDay?: number | null;
  TotalMinutes?: number | null;
  LateMinutes?: number | null;
  MaxLateMinutes?: number | null;
  PermissionPayable?: number | null;
  MachineStatus?: number | null;
  BlockOnSinglePunch?: number | null;
  DefaultReason?: string | null;
  AutoRelieveStatus?: number | null;
  NoOfDays?: number | null;
  RelieveSms?: number | null;
  RelieveEmail?: number | null;
  RelieveWatsApp?: number | null;
  InPunchRequest?: number | null;
  OutPunchRequest?: number | null;
  MessageSms?: number | null;
  MessageEmail?: number | null;
  MessageWatsApp?: number | null;
  MessageSmsOnRequest?: number | null;
  MessageEmailOnRequest?: number | null;
  MessageWatsAppOnRequest?: number | null;
  SURL?: string | null;
  SUsername?: string | null;
  SCurrentPassword?: string | null;
  SSenderId?: string | null;
  SType?: string | null;
  SMobile?: number | null;
  MHost?: string | null;
  MCurrentPassword?: string | null;
  MMail?: string | null;
  MPort?: string | null;
  Muser?: string | null;
  MSSl?: number | null;
  MTLS?: number | null;
  Mciphers?: string | null;
  MFromEmail?: string | null;
  MFromLab?: string | null;
  MEmail?: string | null;
  MsgType?: string | null;
  Message?: string | null;
  MsgTime?: string | null;
  MsgSMSFlag?: number | null;
  MsgEmailFlag?: number | null;
  MsgWhatsappFlag?: number | null;
  MsgMobile?: number | null;
  MsgEmail?: string | null;
  WURL?: string | null;
  WUsername?: string | null;
  WCurrentPassword?: string | null;
  SWSenderId?: string | null;
  WType?: string | null;
  WMobile?: number | null;
  PF?: string | number | null;
  ESI?: string | number | null;
  PFLimit?: string | number | null;
  ESILimit?: string | number | null;
  Bonus?: string | number | null;
  BonusLimit?: string | number | null;
  WorkingDays?: string | number | null;
  Prefix?: string | null;
  sms_otp_login?: number | null;
  email_otp_login?: number | null;
  whatsapp_otp_login?: number | null;
  two_factor_login?: number | null;
  two_factor_approval?: number | null;
  sms_otp_approval?: number | null;
  email_otp_approval?: number | null;
  welfare_flag?: number | null;
  employee_advance_eligiblity_in_months?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface CompanySettingsCreationAttributes
  extends Optional<CompanySettingsAttributes, "ID"> {}

export class CompanySettings extends Model<
  CompanySettingsAttributes,
  CompanySettingsCreationAttributes
> {
  public ID!: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  public static associate(models: Record<string, any>): void {
    CompanySettings.belongsTo(models.CompanyUnit, {
      foreignKey: "Unitid",
      targetKey: "id",
      as: "Unit",
      constraints: false,
    });
  }
}

export const initCompanySettings = (sequelize: Sequelize): void => {
  CompanySettings.init(
    {
      ID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      EntryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      Unitid: { type: DataTypes.INTEGER },
      Logo: { type: DataTypes.STRING(255) },
      DigitalSignature: { type: DataTypes.STRING(255) },
      CompanyStartTime: { type: DataTypes.TIME },
      CompanyEndTime: { type: DataTypes.TIME },
      Weekstart: { type: DataTypes.INTEGER },
      WeekendDays: { type: DataTypes.INTEGER },
      Monthstart: { type: DataTypes.INTEGER },
      MonthEnd: { type: DataTypes.INTEGER },
      CalendarWeekStart: { type: DataTypes.INTEGER },
      CalendarWeekend: { type: DataTypes.INTEGER },
      ForthNightStart: { type: DataTypes.INTEGER },
      ForthNightEnd: { type: DataTypes.INTEGER },
      YearStart: { type: DataTypes.INTEGER },
      YearEnd: { type: DataTypes.INTEGER },
      PortalStartTime: { type: DataTypes.TIME },
      PortalEndTime: { type: DataTypes.TIME },
      leave_shift: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
      LeaveType: { type: DataTypes.STRING(255) },
      LeaveCredits: { type: DataTypes.INTEGER },
      CarryEL: { type: DataTypes.INTEGER },
      EarnedLeavePayable: { type: DataTypes.INTEGER },
      OndutyPayable: { type: DataTypes.INTEGER },
      PermissionCount: { type: DataTypes.INTEGER },
      PermissionType: { type: DataTypes.STRING(255) },
      MinutesPerDay: { type: DataTypes.INTEGER },
      TotalMinutes: { type: DataTypes.INTEGER },
      LateMinutes: { type: DataTypes.INTEGER },
      MaxLateMinutes: { type: DataTypes.INTEGER },
      PermissionPayable: { type: DataTypes.INTEGER },
      MachineStatus: { type: DataTypes.INTEGER },
      BlockOnSinglePunch: { type: DataTypes.INTEGER },
      DefaultReason: { type: DataTypes.STRING(255) },
      AutoRelieveStatus: { type: DataTypes.INTEGER },
      NoOfDays: { type: DataTypes.INTEGER },
      RelieveSms: { type: DataTypes.INTEGER },
      RelieveEmail: { type: DataTypes.INTEGER },
      RelieveWatsApp: { type: DataTypes.INTEGER },
      InPunchRequest: { type: DataTypes.INTEGER },
      OutPunchRequest: { type: DataTypes.INTEGER },
      MessageSms: { type: DataTypes.INTEGER },
      MessageEmail: { type: DataTypes.INTEGER },
      MessageWatsApp: { type: DataTypes.INTEGER },
      MessageSmsOnRequest: { type: DataTypes.INTEGER },
      MessageEmailOnRequest: { type: DataTypes.INTEGER },
      MessageWatsAppOnRequest: { type: DataTypes.INTEGER },
      SURL: { type: DataTypes.STRING(250) },
      SUsername: { type: DataTypes.STRING(150) },
      SCurrentPassword: { type: DataTypes.STRING(150) },
      SSenderId: { type: DataTypes.STRING(150) },
      SType: { type: DataTypes.STRING(150) },
      SMobile: { type: DataTypes.BIGINT },
      MHost: { type: DataTypes.STRING(50) },
      MCurrentPassword: { type: DataTypes.STRING(150) },
      MMail: { type: DataTypes.STRING(75) },
      MPort: { type: DataTypes.STRING(75) },
      Muser: { type: DataTypes.STRING(75) },
      MSSl: { type: DataTypes.INTEGER },
      MTLS: { type: DataTypes.INTEGER },
      Mciphers: { type: DataTypes.STRING(150) },
      MFromEmail: { type: DataTypes.STRING(150) },
      MFromLab: { type: DataTypes.STRING(150) },
      MEmail: { type: DataTypes.STRING(250) },
      MsgType: { type: DataTypes.STRING(50) },
      Message: { type: DataTypes.STRING(250) },
      MsgTime: { type: DataTypes.TIME },
      MsgSMSFlag: { type: DataTypes.INTEGER, defaultValue: 0 },
      MsgEmailFlag: { type: DataTypes.INTEGER, defaultValue: 0 },
      MsgWhatsappFlag: { type: DataTypes.INTEGER, defaultValue: 0 },
      MsgMobile: { type: DataTypes.BIGINT },
      MsgEmail: { type: DataTypes.STRING(100) },
      WURL: { type: DataTypes.STRING(150) },
      WUsername: { type: DataTypes.STRING(150) },
      WCurrentPassword: { type: DataTypes.STRING(150) },
      SWSenderId: { type: DataTypes.STRING(150) },
      WType: { type: DataTypes.STRING(150) },
      WMobile: { type: DataTypes.BIGINT },
      PF: { type: DataTypes.DECIMAL(18, 0), defaultValue: 0 },
      ESI: { type: DataTypes.DECIMAL(18, 0), defaultValue: 0 },
      PFLimit: { type: DataTypes.DECIMAL(18, 0), defaultValue: 0 },
      ESILimit: { type: DataTypes.DECIMAL(18, 0), defaultValue: 0 },
      Bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      BonusLimit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
      WorkingDays: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0.0 },
      Prefix: { type: DataTypes.STRING(45) },
      sms_otp_login: { type: DataTypes.TINYINT, defaultValue: 0 },
      email_otp_login: { type: DataTypes.TINYINT, defaultValue: 0 },
      whatsapp_otp_login: { type: DataTypes.TINYINT, defaultValue: 0 },
      two_factor_login: { type: DataTypes.TINYINT, defaultValue: 0 },
      two_factor_approval: { type: DataTypes.TINYINT, defaultValue: 0 },
      sms_otp_approval: { type: DataTypes.TINYINT, defaultValue: 0 },
      email_otp_approval: { type: DataTypes.TINYINT, defaultValue: 0 },
      welfare_flag: { type: DataTypes.TINYINT, defaultValue: 0 },
      employee_advance_eligiblity_in_months: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE },
      updated_at: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "CompanySettings",
      tableName: "companysettings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
