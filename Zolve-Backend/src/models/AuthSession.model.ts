import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface AuthSessionAttributes {
  id: number;
  RegisterId: number;
  access_token: string;
  refresh_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  login_time?: Date;
  logout_time?: Date | null;
  is_active?: boolean;
}

export interface AuthSessionCreationAttributes
  extends Optional<AuthSessionAttributes, "id" | "login_time" | "logout_time" | "is_active"> {}

export class AuthSession
  extends Model<AuthSessionAttributes, AuthSessionCreationAttributes>
  implements AuthSessionAttributes
{
  public id!: number;
  public RegisterId!: number;
  public access_token!: string;
  public refresh_token!: string;
  public ip_address?: string | null;
  public user_agent?: string | null;
  public login_time?: Date;
  public logout_time?: Date | null;
  public is_active?: boolean;

  public static associate(models: Record<string, any>): void {
    AuthSession.belongsTo(models.Register, {
      foreignKey: "RegisterId",
      as: "Register",
    });
  }
}

export const initAuthSession = (sequelize: Sequelize): void => {
  AuthSession.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      RegisterId: { type: DataTypes.INTEGER, allowNull: false },
      access_token: { type: DataTypes.TEXT, allowNull: false },
      refresh_token: { type: DataTypes.TEXT, allowNull: false },
      ip_address: { type: DataTypes.STRING(100), allowNull: true },
      user_agent: { type: DataTypes.STRING(255), allowNull: true },
      login_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      logout_time: { type: DataTypes.DATE, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "AuthSession",
      tableName: "auth_sessions",
      timestamps: false,
    }
  );
};
