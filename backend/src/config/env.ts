import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['GEMINI_API_KEY'] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(`Warning: Missing environment variable ${key}`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  INNGEST_DEV: process.env.INNGEST_DEV === '1',
};