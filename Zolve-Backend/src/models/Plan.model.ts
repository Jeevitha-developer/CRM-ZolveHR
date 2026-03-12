import { DataTypes, Model, Optional, Sequelize } from "sequelize";

type BillingCycle   = "monthly" | "quarterly" | "half_yearly" | "yearly";
type BillingType    = "prepaid" | "postpaid";
type OveragePolicy  = "hard_stop" | "charge_overage" | "notify_only";

interface PlanAttributes {
  id:               number;
  name:             string;
  description?:     string;

  price_per_user:   number;   // ← Core: ₹129, ₹109, ₹99
  billing_cycle:    BillingCycle;
  billing_months:   number;   // 3, 6, 12
  billing_type:     BillingType;

  min_users:        number;   // minimum users they must buy (e.g. 5)
  max_users:        number;   // maximum users allowed (e.g. 500)

  overage_policy:   OveragePolicy;
  features:         string[];
  module_access:    Record<string, boolean>;
  is_active:        boolean;
}

interface PlanCreationAttributes extends Optional<PlanAttributes,
  "id" | "billing_type" | "overage_policy" | "is_active" | "description" | "min_users" | "max_users"
> {}

export class Plan extends Model<PlanAttributes, PlanCreationAttributes>
  implements PlanAttributes {
  public id!:               number;
  public name!:             string;
  public description?:      string;

  public price_per_user!:   number;
  public billing_cycle!:    BillingCycle;
  public billing_months!:   number;
  public billing_type!:     BillingType;

  public min_users!:        number;
  public max_users!:        number;

  public overage_policy!:   OveragePolicy;
  public features!:         string[];
  public module_access!:    Record<string, boolean>;
  public is_active!:        boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initPlan = (sequelize: Sequelize): void => {
  Plan.init({
    id:             { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
    name:           { type: DataTypes.STRING(100),   allowNull: false, unique: true },
    description:    { type: DataTypes.TEXT,          allowNull: true  },

    price_per_user: { type: DataTypes.DECIMAL(10,2), allowNull: false },  // ₹129/₹109/₹99
    billing_cycle:  { type: DataTypes.ENUM("monthly","quarterly","half_yearly","yearly"), allowNull: false },
    billing_months: { type: DataTypes.INTEGER,       allowNull: false },  // 3/6/12
    billing_type:   { type: DataTypes.ENUM("prepaid","postpaid"), defaultValue: "prepaid" },

    min_users:      { type: DataTypes.INTEGER,       defaultValue: 5   },  // min 5 users
    max_users:      { type: DataTypes.INTEGER,       defaultValue: 500 },  // max 500 users

    overage_policy: { type: DataTypes.ENUM("hard_stop","charge_overage","notify_only"), defaultValue: "hard_stop" },
    features:       { type: DataTypes.JSON,          defaultValue: []  },
    module_access:  { type: DataTypes.JSON,          defaultValue: {}  },
    is_active:      { type: DataTypes.BOOLEAN,       defaultValue: true },
  }, { sequelize, tableName: "plans", timestamps: true });
};