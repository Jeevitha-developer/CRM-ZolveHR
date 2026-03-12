import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CompanyUnitAttributes {
  id: number;
  Cmpid: string;
  GstNumber: string;
  PfNumber: string;
  UnitName: string;
  group_id: number;
  Dno_Street: string;
  Nagar: string;
  Village: string;
  Taluk: string;
  District: string;
  State: string;
  Pin_code: string;
  Delflag?: number;
}

export interface CompanyUnitCreationAttributes
  extends Optional<CompanyUnitAttributes, "id" | "Delflag"> {}

export class CompanyUnit
  extends Model<CompanyUnitAttributes, CompanyUnitCreationAttributes>
  implements CompanyUnitAttributes
{
  public id!: number;
  public Cmpid!: string;
  public GstNumber!: string;
  public PfNumber!: string;
  public UnitName!: string;
  public group_id!: number;
  public Dno_Street!: string;
  public Nagar!: string;
  public Village!: string;
  public Taluk!: string;
  public District!: string;
  public State!: string;
  public Pin_code!: string;
  public Delflag?: number;

  public static associate(models: Record<string, any>): void {
    CompanyUnit.belongsTo(models.Company_Group, {
      foreignKey: "group_id",
      as: "company_group_id",
      targetKey: "id",
      constraints: false,
    });
  }
}

export const initCompanyUnit = (sequelize: Sequelize): void => {
  CompanyUnit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Cmpid: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      GstNumber: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      PfNumber: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      UnitName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Dno_Street: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Nagar: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Village: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Taluk: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      District: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      State: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Pin_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      Delflag: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "CompanyUnit",
      tableName: "companyunit",
      timestamps: false,
    }
  );
};
