import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface InvoiceAttributes {
  id:              number;
  client_id:       number;
  subscription_id: number;
  payment_id?:     number;
  invoice_number:  string;
  invoice_date:    string;
  due_date?:       string;
  amount:          number;
  tax:             number;
  total:           number;
  status:          "draft" | "sent" | "paid" | "overdue" | "cancelled";
  notes?:          string;
  created_by?:     number;
}

interface InvoiceCreationAttributes extends Optional<InvoiceAttributes,
  "id" | "tax" | "status" | "payment_id" | "due_date" | "notes" | "created_by"
> {}

export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!:              number;
  public client_id!:       number;
  public subscription_id!: number;
  public payment_id?:      number;
  public invoice_number!:  string;
  public invoice_date!:    string;
  public due_date?:        string;
  public amount!:          number;
  public tax!:             number;
  public total!:           number;
  public status!:          "draft" | "sent" | "paid" | "overdue" | "cancelled";
  public notes?:           string;
  public created_by?:      number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initInvoice = (sequelize: Sequelize): void => {
  Invoice.init({
    id:              { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
    client_id:       { type: DataTypes.INTEGER,       allowNull: false },
    subscription_id: { type: DataTypes.INTEGER,       allowNull: false },
    payment_id:      { type: DataTypes.INTEGER,       allowNull: true  },
    invoice_number:  { type: DataTypes.STRING(50),    allowNull: false, unique: true },
    invoice_date:    { type: DataTypes.DATEONLY,      allowNull: false },
    due_date:        { type: DataTypes.DATEONLY,      allowNull: true  },
    amount:          { type: DataTypes.DECIMAL(10,2), allowNull: false },
    tax:             { type: DataTypes.DECIMAL(10,2), defaultValue: 0  },
    total:           { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status:          { type: DataTypes.ENUM("draft","sent","paid","overdue","cancelled"), defaultValue: "draft" },
    notes:           { type: DataTypes.TEXT,          allowNull: true  },
    created_by:      { type: DataTypes.INTEGER,       allowNull: true  },
  }, { sequelize, tableName: "invoices", timestamps: true });
};