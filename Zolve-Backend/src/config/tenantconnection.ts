import { Sequelize } from "sequelize";

const connections: Record<string, Sequelize> = {};

export const getTenantDB = (dbName: string): Sequelize => {
  if (!connections[dbName]) {
    connections[dbName] = new Sequelize(
      dbName,
      process.env.DB_USER as string,
      process.env.DB_PASSWORD as string,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
      }
    );
  }

  return connections[dbName];
};