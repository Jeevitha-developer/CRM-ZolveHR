import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { PaymentStatus, SubscriptionStatus, BillingCycle } from "../types";

interface SubscriptionAttributes {
  id:                  number;
  client_id:           number;
  plan_id:             number;
  created_by?:         number;
  start_date:          string;
  end_date:            string;
  trial_ends_at?:      string;
  billing_cycle:       BillingCycle;
  billing_months:      number;
  num_users:           number;       // ← how many users client bought
  amount_paid:         number;       // ← price_per_user × num_users × billing_months
  discount:            number;       // ← discount applied
  final_amount:        number;       // ← amount_paid - discount
  payment_status:      PaymentStatus;
  subscription_status: SubscriptionStatus;
  auto_renew:          boolean;
  remarks?:            string;
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes,
  "id"        |
  "discount"  |
  "auto_renew"|
  "payment_status"      |
  "subscription_status" |
  "created_by"          |
  "trial_ends_at"
> {}

export class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes {
  public id!:                  number;
  public client_id!:           number;
  public plan_id!:             number;
  public created_by?:          number;
  public start_date!:          string;
  public end_date!:            string;
  public trial_ends_at?:       string;
  public billing_cycle!:       BillingCycle;
  public billing_months!:      number;
  public num_users!:           number;
  public amount_paid!:         number;
  public discount!:            number;
  public final_amount!:        number;
  public payment_status!:      PaymentStatus;
  public subscription_status!: SubscriptionStatus;
  public auto_renew!:          boolean;
  public remarks?:             string;
  public readonly createdAt!:  Date;
  public readonly updatedAt!:  Date;
}

export const initSubscription = (sequelize: Sequelize): void => {
  Subscription.init({
    id:                  { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
    client_id:           { type: DataTypes.INTEGER,       allowNull: false },
    plan_id:             { type: DataTypes.INTEGER,       allowNull: false },
    created_by:          { type: DataTypes.INTEGER,       allowNull: true  },
    start_date:          { type: DataTypes.DATEONLY,      allowNull: false },
    end_date:            { type: DataTypes.DATEONLY,      allowNull: false },
    trial_ends_at:       { type: DataTypes.DATEONLY,      allowNull: true  },
    billing_cycle:       { type: DataTypes.ENUM("monthly","quarterly","half_yearly","yearly"), allowNull: false },
    billing_months:      { type: DataTypes.INTEGER,       allowNull: false },
    num_users:           { type: DataTypes.INTEGER,       allowNull: false }, // ← users bought
    amount_paid:         { type: DataTypes.DECIMAL(10,2), allowNull: false }, // ← before discount
    discount:            { type: DataTypes.DECIMAL(10,2), defaultValue: 0  }, // ← discount
    final_amount:        { type: DataTypes.DECIMAL(10,2), allowNull: false }, // ← after discount
    payment_status:      { type: DataTypes.ENUM("paid","pending","failed","refunded"),        defaultValue: "pending" },
    subscription_status: { type: DataTypes.ENUM("active","expired","cancelled","trial"),      defaultValue: "active"  },
    auto_renew:          { type: DataTypes.BOOLEAN,       defaultValue: false },
    remarks:             { type: DataTypes.TEXT,          allowNull: true  },
  }, { sequelize, tableName: "subscriptions", timestamps: true });
};