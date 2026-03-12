import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface DesignationAttributes {
  id: number;
  Designation?: string | null;
  Delflag?: number | null;
}

export interface DesignationCreationAttributes extends Optional<DesignationAttributes, "id"> {}

export class Designation
  extends Model<DesignationAttributes, DesignationCreationAttributes>
  implements DesignationAttributes
{
  public id!: number;
  public Designation?: string | null;
  public Delflag?: number | null;
}

export const initDesignation = (sequelize: Sequelize): void => {
  Designation.init(
    {
      id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      Designation: { type: DataTypes.STRING, allowNull: true },
      Delflag: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Designation",
      tableName: "designation",
      timestamps: false,
    }
  );
};
