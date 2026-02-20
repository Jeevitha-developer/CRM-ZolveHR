import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { UserRole } from "../types";

interface UserAttributes {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  mobile?:    string;
  password:   string;
  role:       UserRole;
  is_active:  boolean;
  last_login?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "role" | "is_active"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!:          number;
  public first_name!:  string;
  public last_name!:   string;
  public email!:       string;
  public mobile?:      string;
  public password!:    string;
  public role!:        UserRole;
  public is_active!:   boolean;
  public last_login?:  Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initUser = (sequelize: Sequelize): void => {
  User.init({
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name:  { type: DataTypes.STRING(100), allowNull: false },
    email:      { type: DataTypes.STRING(255), allowNull: false },
    mobile:     { type: DataTypes.STRING(20),  allowNull: true, unique: true },
    password:   { type: DataTypes.STRING(255), allowNull: false },
    role:       { type: DataTypes.ENUM("admin","manager","user"), defaultValue: "user" },
    is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login: { type: DataTypes.DATE,    allowNull: true  },
  }, { sequelize, tableName: "users", timestamps: true, indexes: [{ unique: true, fields: ["email"] }] });
};
