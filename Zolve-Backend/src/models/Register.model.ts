import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface RegisterAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: string | null;
  created_at?: Date | null;
  reset_token?: string | null;
  reset_token_expiry?: Date | null;
  company_id?: number | null;
  user_image?: string | null;
  EmployeeNo?: string | null;
  Mobile?: number | null;
}

export interface RegisterCreationAttributes
  extends Optional<RegisterAttributes, "id" | "role" | "created_at"> {}

export class Register
  extends Model<RegisterAttributes, RegisterCreationAttributes>
  implements RegisterAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role?: string | null;
  public created_at?: Date | null;
  public reset_token?: string | null;
  public reset_token_expiry?: Date | null;
  public company_id?: number | null;
  public user_image?: string | null;
  public EmployeeNo?: string | null;
  public Mobile?: number | null;

  public static associate(models: Record<string, any>): void {
    Register.belongsTo(models.MasterEmployee, {
      foreignKey: "EmployeeNo",
      targetKey: "EmployeeNo",
      as: "Employee_No_for_register",
      constraints: false,
    });

    Register.belongsTo(models.CompanyUnit, {
      foreignKey: "company_id",
      targetKey: "id",
      as: "unit_id_for_register",
      constraints: false,
    });
  }
}

export const initRegister = (sequelize: Sequelize): void => {
  Register.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(25),
        allowNull: true,
        defaultValue: "user",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      reset_token: {
        type: DataTypes.STRING(225),
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_image: {
        type: DataTypes.STRING(225),
        allowNull: true,
      },
      EmployeeNo: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Mobile: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Register",
      tableName: "register",
      timestamps: false,
    }
  );
};
