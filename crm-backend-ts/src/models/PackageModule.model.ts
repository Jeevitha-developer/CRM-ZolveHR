import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface PackageModuleAttributes {
  id:          number;
  name:        string;
  description?:string;
  is_active:   boolean;
}
interface PackageModuleCreationAttributes extends Optional<PackageModuleAttributes, "id" | "is_active"> {}

export class PackageModule extends Model<PackageModuleAttributes, PackageModuleCreationAttributes> implements PackageModuleAttributes {
  public id!:           number;
  public name!:         string;
  public description?:  string;
  public is_active!:    boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initPackageModule = (sequelize: Sequelize): void => {
  PackageModule.init({
    id:          { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT,        allowNull: true  },
    is_active:   { type: DataTypes.BOOLEAN,     defaultValue: true },
  }, { sequelize, tableName: "package_modules", timestamps: true });
};
