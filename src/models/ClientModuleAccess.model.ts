import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface ClientModuleAccessAttributes {
  id: number;
  client_id: number;
  module_id: number;
  is_enabled: boolean;
}
interface ClientModuleAccessCreationAttributes extends Optional<ClientModuleAccessAttributes, "id" | "is_enabled"> { }

export class ClientModuleAccess extends Model<ClientModuleAccessAttributes, ClientModuleAccessCreationAttributes> implements ClientModuleAccessAttributes {
  public id!: number;
  public client_id!: number;
  public module_id!: number;
  public is_enabled!: boolean;
}

export const initClientModuleAccess = (sequelize: Sequelize): void => {
  ClientModuleAccess.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    sequelize, tableName: "client_module_access", timestamps: false,
    indexes: [{ unique: true, fields: ["client_id", "module_id"] }]
  });
};
