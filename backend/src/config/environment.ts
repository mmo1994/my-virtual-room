import dotenv from 'dotenv';
import { EnvConfig } from '../types';
import { logger } from './logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT',
  'CORS_ORIGIN',
  'FROM_EMAIL',
  'FROM_NAME'
];

const validateEnvironment = (): void => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

// Validate environment on startup
validateEnvironment();

export const config: EnvConfig = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Server Configuration
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  
  // Email Configuration
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || undefined,
  SMTP_HOST: process.env.SMTP_HOST || undefined,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: process.env.SMTP_USER || undefined,
  SMTP_PASS: process.env.SMTP_PASS || undefined,
  FROM_EMAIL: process.env.FROM_EMAIL!,
  FROM_NAME: process.env.FROM_NAME!,
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '15728640', 10), // 15MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/heic',
  
  // AI Service Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  AI_SERVICE_PROVIDER: process.env.AI_SERVICE_PROVIDER || 'openai',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || undefined,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Security
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'fallback-cookie-secret',
  
  // Application URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001'
};

export default config; 