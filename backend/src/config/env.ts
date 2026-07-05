import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  MONGO_URI: process.env.MONGO_URI || "",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  RESET_TOKEN_EXPIRES_MIN: parseInt(process.env.RESET_TOKEN_EXPIRES_MIN || "30", 10),

  MAX_DEVICES_PER_STUDENT: parseInt(process.env.MAX_DEVICES_PER_STUDENT || "2", 10),

  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "2525", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@akmlms.com",
  FROM_NAME: process.env.FROM_NAME || "AKM LMS",

  RATE_LIMIT_WINDOW_MIN: parseInt(process.env.RATE_LIMIT_WINDOW_MIN || "15", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "200", 10),

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@akmlms.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@12345",
  ADMIN_NAME: process.env.ADMIN_NAME || "Super Admin",
};
