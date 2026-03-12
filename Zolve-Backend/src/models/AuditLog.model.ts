import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface AuditLogAttributes {
  id:          number;
  user_id?:    number;
  action:      string;
  entity_type: string;
  entity_id?:  number;
  old_value?:  object;
  new_value?:  object;
  ip_address?: string;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes,
  "id" | "user_id" | "entity_id" | "old_value" | "new_value" | "ip_address"
> {}

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes {
  public id!:          number;
  public user_id?:     number;
  public action!:      string;
  public entity_type!: string;
  public entity_id?:   number;
  public old_value?:   object;
  public new_value?:   object;
  public ip_address?:  string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initAuditLog = (sequelize: Sequelize): void => {
  AuditLog.init({
    id:          { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
    user_id:     { type: DataTypes.INTEGER,     allowNull: true  },
    action:      { type: DataTypes.STRING(100), allowNull: false },
    entity_type: { type: DataTypes.STRING(50),  allowNull: false },
    entity_id:   { type: DataTypes.INTEGER,     allowNull: true  },
    old_value:   { type: DataTypes.JSON,        allowNull: true  },
    new_value:   { type: DataTypes.JSON,        allowNull: true  },
    ip_address:  { type: DataTypes.STRING(45),  allowNull: true  },
  }, { sequelize, tableName: "audit_logs", timestamps: true });
};