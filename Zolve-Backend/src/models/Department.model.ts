import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface DepartmentAttributes {
  id: number;
  Department?: string | null;
  Delflag?: number | null;
}

export interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id"> {}

export class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public Department?: string | null;
  public Delflag?: number | null;
}

export const initDepartment = (sequelize: Sequelize): void => {
  Department.init(
    {
      id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      Department: { type: DataTypes.STRING, allowNull: true },
      Delflag: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Department",
      tableName: "department",
      timestamps: false,
    }
  );
};
