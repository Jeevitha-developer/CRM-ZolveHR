import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { PaymentStatus, PaymentMethod } from "../types";

interface PaymentAttributes {
  id:              number;
  subscription_id: number;
  client_id:       number;
  amount:          number;
  currency:        string;
  payment_method:  PaymentMethod;
  payment_status:  PaymentStatus;
  transaction_id?: string;
  receipt_number?: string;      // ← added
  failure_reason?: string;      // ← added
  payment_date?:   string;
  notes?:          string;
  created_by?:     number;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes,
  "id" | "currency" | "payment_method" | "payment_status" |
  "receipt_number" | "failure_reason"
> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes {
  public id!:              number;
  public subscription_id!: number;
  public client_id!:       number;
  public amount!:          number;
  public currency!:        string;
  public payment_method!:  PaymentMethod;
  public payment_status!:  PaymentStatus;
  public transaction_id?:  string;
  public receipt_number?:  string;
  public failure_reason?:  string;
  public payment_date?:    string;
  public notes?:           string;
  public created_by?:      number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initPayment = (sequelize: Sequelize): void => {
  Payment.init({
    id:              { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
    subscription_id: { type: DataTypes.INTEGER,       allowNull: false },
    client_id:       { type: DataTypes.INTEGER,       allowNull: false },
    amount:          { type: DataTypes.DECIMAL(10,2), allowNull: false },
    currency:        { type: DataTypes.STRING(10),    defaultValue: "INR" },
    payment_method:  { type: DataTypes.ENUM("upi","bank_transfer","card","cash","razorpay"), defaultValue: "upi" },
    payment_status:  { type: DataTypes.ENUM("paid","pending","failed","refunded"),           defaultValue: "pending" },
    transaction_id:  { type: DataTypes.STRING(255),   allowNull: true,  unique: true },  // ← unique
    receipt_number:  { type: DataTypes.STRING(50),    allowNull: true,  unique: true },  // ← added
    failure_reason:  { type: DataTypes.STRING(255),   allowNull: true },                 // ← added
    payment_date:    { type: DataTypes.DATEONLY,      allowNull: true  },
    notes:           { type: DataTypes.TEXT,          allowNull: true  },
    created_by:      { type: DataTypes.INTEGER,       allowNull: true  },
  }, { sequelize, tableName: "payments", timestamps: true });
};