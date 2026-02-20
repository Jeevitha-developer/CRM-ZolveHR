import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface NotificationAttributes {
    id: number;
    client_id: number;
    type: "subscription_expiry" | "payment_due" | "payment_received" | "general";
    channel: "email" | "whatsapp" | "sms";
    message: string;
    is_read: boolean;
    sent_at?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes,
    "id" | "is_read" | "sent_at"
> { }

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes>
    implements NotificationAttributes {
    public id!: number;
    public client_id!: number;
    public type!: "subscription_expiry" | "payment_due" | "payment_received" | "general";
    public channel!: "email" | "whatsapp" | "sms";
    public message!: string;
    public is_read!: boolean;
    public sent_at?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initNotification = (sequelize: Sequelize): void => {
    Notification.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        client_id: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.ENUM("subscription_expiry", "payment_due", "payment_received", "general"), allowNull: false },
        channel: { type: DataTypes.ENUM("email", "whatsapp", "sms"), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        sent_at: { type: DataTypes.DATE, allowNull: true },
    }, { sequelize, tableName: "notifications", timestamps: true });
};