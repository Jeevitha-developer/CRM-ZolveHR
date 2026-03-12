import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { ClientStatus, HrmsStatus, CompanySize } from "../types";

interface ClientAttributes {
  id:                number;
  company_name:      string;
  contact_person?:   string;
  email?:            string;
  phone?:            string;
  address?:          string;
  city?:             string;
  state?:            string;
  country?:          string;
  pincode?:          string;
  gst_number?:       string;
  pan_number?:       string;
  industry?:         string;
  company_size?:     CompanySize;
  status:            ClientStatus;
  notes?:            string;
  hrms_tenant_id?:   string;
  hrms_db_name?:     string;
  hrms_status:       HrmsStatus;
  hrms_activated_at?:Date;
  created_by?:       number;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, "id" | "status" | "hrms_status"> {}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id!:               number;
  public company_name!:     string;
  public contact_person?:   string;
  public email?:            string;
  public phone?:            string;
  public address?:          string;
  public city?:             string;
  public state?:            string;
  public country?:          string;
  public pincode?:          string;
  public gst_number?:       string;
  public pan_number?:       string;
  public industry?:         string;
  public company_size?:     CompanySize;
  public status!:           ClientStatus;
  public notes?:            string;
  public hrms_tenant_id?:   string;
  public hrms_db_name?:     string;
  public hrms_status!:      HrmsStatus;
  public hrms_activated_at?:Date;
  public created_by?:       number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initClient = (sequelize: Sequelize): void => {
  Client.init({
    id:                { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
    company_name:      { type: DataTypes.STRING(255), allowNull: false },
    contact_person:    { type: DataTypes.STRING(150), allowNull: true  },
    email:             { type: DataTypes.STRING(255), allowNull: true, unique: true },
    phone:             { type: DataTypes.STRING(20),  allowNull: true  },
    address:           { type: DataTypes.TEXT,        allowNull: true  },
    city:              { type: DataTypes.STRING(100), allowNull: true  },
    state:             { type: DataTypes.STRING(100), allowNull: true  },
    country:           { type: DataTypes.STRING(100), defaultValue: "India" },
    pincode:           { type: DataTypes.STRING(10),  allowNull: true  },
    gst_number:        { type: DataTypes.STRING(20),  allowNull: true  },
    pan_number:        { type: DataTypes.STRING(15),  allowNull: true  },
    industry:          { type: DataTypes.STRING(100), allowNull: true  },
    company_size:      { type: DataTypes.ENUM("1-10","11-50","51-200","201-500","500+"), allowNull: true },
    status:            { type: DataTypes.ENUM("active","inactive","suspended"), defaultValue: "active" },
    notes:             { type: DataTypes.TEXT,        allowNull: true  },
    hrms_tenant_id:    { type: DataTypes.STRING(100), allowNull: true, unique: true },
    hrms_db_name:      { type: DataTypes.STRING(100), allowNull: true  },
    hrms_status:       { type: DataTypes.ENUM("pending","active","inactive","suspended"), defaultValue: "pending" },
    hrms_activated_at: { type: DataTypes.DATE,        allowNull: true  },
    created_by:        { type: DataTypes.INTEGER,     allowNull: true  },
  }, { sequelize, tableName: "clients", timestamps: true });
};
