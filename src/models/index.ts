import { sequelize } from "../config/database";
import { User, initUser } from "./User.model";
import { Client, initClient } from "./Client.model";
import { Plan, initPlan } from "./Plan.model";
import { PackageModule, initPackageModule } from "./PackageModule.model";
import { ClientModuleAccess, initClientModuleAccess } from "./ClientModuleAccess.model";
import { Subscription, initSubscription } from "./Subscription.model";
import { Payment, initPayment } from "./Payment.model";
import { Invoice, initInvoice } from "./Invoice.model";
import { AuditLog, initAuditLog } from "./AuditLog.model";
import { Notification, initNotification } from "./Notification.model";

// ─── Init all models (ORDER MATTERS) ─────────────────────────
initUser(sequelize);
initClient(sequelize);
initPlan(sequelize);
initPackageModule(sequelize);
initClientModuleAccess(sequelize);
initSubscription(sequelize);
initPayment(sequelize);
initInvoice(sequelize);
initAuditLog(sequelize);
initNotification(sequelize);

// ─── Associations (define each ONCE only) ────────────────────

// User → Client, Subscription, Payment
User.hasMany(Client, { foreignKey: "created_by", as: "createdClients" });
User.hasMany(Subscription, { foreignKey: "created_by", as: "createdSubscriptions" });
User.hasMany(Payment, { foreignKey: "created_by", as: "recordedPayments" });
Payment.belongsTo(User, { foreignKey: "created_by", as: "recordedBy" });

// Client ↔ Subscription
Client.hasMany(Subscription, { foreignKey: "client_id", as: "subscriptions" });
Subscription.belongsTo(Client, { foreignKey: "client_id", as: "client" });

// Client ↔ Payment
Client.hasMany(Payment, { foreignKey: "client_id", as: "payments" });
Payment.belongsTo(Client, { foreignKey: "client_id", as: "client" });

// Client ↔ ClientModuleAccess
Client.hasMany(ClientModuleAccess, { foreignKey: "client_id", as: "moduleAccess" });
ClientModuleAccess.belongsTo(Client, { foreignKey: "client_id", as: "client" });

// Plan ↔ Subscription
Plan.hasMany(Subscription, { foreignKey: "plan_id", as: "subscriptions" });
Subscription.belongsTo(Plan, { foreignKey: "plan_id", as: "plan" });

// Subscription ↔ Payment
Subscription.hasMany(Payment, { foreignKey: "subscription_id", as: "payments" });
Payment.belongsTo(Subscription, { foreignKey: "subscription_id", as: "subscription" });

// PackageModule ↔ ClientModuleAccess
PackageModule.hasMany(ClientModuleAccess, { foreignKey: "module_id", as: "clientAccess" });
ClientModuleAccess.belongsTo(PackageModule, { foreignKey: "module_id", as: "module" });

// Client ↔ Invoice
Client.hasMany(Invoice, { foreignKey: "client_id", as: "invoices" });
Invoice.belongsTo(Client, { foreignKey: "client_id", as: "client" });

// Subscription ↔ Invoice
Subscription.hasMany(Invoice, { foreignKey: "subscription_id", as: "invoices" });
Invoice.belongsTo(Subscription, { foreignKey: "subscription_id", as: "subscription" });

// Payment ↔ Invoice
Payment.hasOne(Invoice, { foreignKey: "payment_id", as: "invoice" });
Invoice.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });

// User ↔ AuditLog
User.hasMany(AuditLog, { foreignKey: "user_id", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Client ↔ Notification
Client.hasMany(Notification, { foreignKey: "client_id", as: "notifications" });
Notification.belongsTo(Client, { foreignKey: "client_id", as: "client" });

// ─── Exports ──────────────────────────────────────────────────
export {
  sequelize,
  User, Client, Plan,
  PackageModule, ClientModuleAccess,
  Subscription, Payment, Invoice, AuditLog, Notification
};