import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface AttendanceFinalApprovalAttributes {
  EmployeeNo: string;
  working_days?: string | number | null;
  present_days?: string | number | null;
  over_time?: string | number | null;
  nfh?: string | number | null;
  loss_of_pay?: string | number | null;
  approved_by?: number | null;
  approve_flag?: boolean | null;
  approve_date?: Date | null;
}

export interface AttendanceFinalApprovalCreationAttributes
  extends Optional<
    AttendanceFinalApprovalAttributes,
    | "working_days"
    | "present_days"
    | "over_time"
    | "nfh"
    | "loss_of_pay"
    | "approved_by"
    | "approve_flag"
    | "approve_date"
  > {}

export class AttendanceFinalApproval
  extends Model<AttendanceFinalApprovalAttributes, AttendanceFinalApprovalCreationAttributes>
  implements AttendanceFinalApprovalAttributes
{
  public EmployeeNo!: string;
  public working_days?: string | number | null;
  public present_days?: string | number | null;
  public over_time?: string | number | null;
  public nfh?: string | number | null;
  public loss_of_pay?: string | number | null;
  public approved_by?: number | null;
  public approve_flag?: boolean | null;
  public approve_date?: Date | null;
}

export const initAttendanceFinalApproval = (sequelize: Sequelize): void => {
  AttendanceFinalApproval.init(
    {
      EmployeeNo: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      working_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      present_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      over_time: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      nfh: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      loss_of_pay: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approve_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      approve_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AttendanceFinalApproval",
      tableName: "attendance_final_approval",
      timestamps: false,
    }
  );
};
