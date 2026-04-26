import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  NODE_ENV:       process.env.NODE_ENV       ?? 'development',
  PORT:           parseInt(process.env.PORT  ?? '3000', 10),
  JWT_SECRET:     process.env.JWT_SECRET     ?? 'hackburger-super-secret-key-dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  DB_PATH:        process.env.DB_PATH        ?? path.resolve(__dirname, '../../../database/hackburger.db'),
  SMTP_HOST:      process.env.SMTP_HOST      ?? 'smtp.mailtrap.io',
  SMTP_PORT:      parseInt(process.env.SMTP_PORT ?? '587', 10),
  SMTP_USER:      process.env.SMTP_USER      ?? '',
  SMTP_PASS:      process.env.SMTP_PASS      ?? '',
  CORS_ORIGIN:    process.env.CORS_ORIGIN    ?? ['http://localhost:4200', 'http://172.27.176.109:4200'],
};
