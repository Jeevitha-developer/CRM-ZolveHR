import { sequelize } from "../config/database";
import { Client, initClient } from "./Client.model";

import { PackageModule, initPackageModule } from "./PackageModule.model";
import { ClientModuleAccess, initClientModuleAccess } from "./ClientModuleAccess.model";
import { AuditLog, initAuditLog } from "./AuditLog.model";
import { Notification, initNotification } from "./Notification.model";
import { AuthSession, initAuthSession } from "./AuthSession.model";

// Initialize models
initClient(sequelize);
initPackageModule(sequelize);
initClientModuleAccess(sequelize);
initAuditLog(sequelize);
initNotification(sequelize);
initAuthSession(sequelize);

// Associations

Client.hasMany(ClientModuleAccess, {
  foreignKey: "client_id",
  as: "moduleAccess",
});

ClientModuleAccess.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
});

PackageModule.hasMany(ClientModuleAccess, {
  foreignKey: "module_id",
  as: "clientAccess",
});

ClientModuleAccess.belongsTo(PackageModule, {
  foreignKey: "module_id",
  as: "module",
});


Client.hasMany(Notification, {
  foreignKey: "client_id",
  as: "notifications",
});

Notification.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
});

export {
  sequelize,
  Client,
  PackageModule,
  ClientModuleAccess,
  AuditLog,
  Notification,
  AuthSession,
};