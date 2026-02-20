import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Primary DB (MySQL/MariaDB)
  db: {
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || '',
    port: Number(process.env.DB_PORT) || 3306,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },

  // Support Email (Nodemailer)
  email: {
    user: process.env.SUPPORT_EMAIL || '',
    password: process.env.SUPPORT_EMAIL_PASS || '',
  },

  // Central DB
  centralDb: {
    user: process.env.CENTRAL_DB_USER || '',
    password: process.env.CENTRAL_DB_PASSWORD || '',
    name: process.env.CENTRAL_DB_NAME || '',
  },

  // SQL DB (separate connection)
  sqlDb: {
    host: process.env.SQL_DB_HOST || '',
    user: process.env.SQL_DB_USER || '',
    password: process.env.SQL_DB_PASSWORD || '',
    name: process.env.SQL_DB_NAME || '',
  },

  // WhatsApp (Meta Cloud API)
  whatsapp: {
    phoneNumberId: process.env.PHONE_NUMBER_ID || '',
    accessToken: process.env.ACCESS_TOKEN || '',
  },

  // ODBC / MySQL Driver (for ODBC connections)
  odbc: {
    driver: process.env.MYSQL_DRIVER || 'MySQL ODBC 8.0 Unicode Driver',
    server: process.env.MYSQL_SERVER || '',
    database: process.env.MYSQL_DATABASE || '',
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    port: Number(process.env.MYSQL_PORT) || 3306,
  },

  // Firebase Cloud Messaging
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || '',
  },

  // ESSL (Attendance / Biometric)
  essl: {
    user: process.env.ESSL_USER || 'sa',
    password: process.env.ESSL_PASSWORD || '',
    server: process.env.ESSL_SERVER || '',
    db: process.env.ESSL_DB || '',
  },

  // SMS Gateway
  sms: {
    accessToken: process.env.SMS_ACCESS_TOKEN || '',
    authSignature: process.env.SMS_AUTH_SIGNATURE || '',
  },
};

