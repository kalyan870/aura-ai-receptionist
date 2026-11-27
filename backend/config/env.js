import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Secret Management: require explicit strong secret in production; ephemeral CSPRNG secret in dev/test
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production.');
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
} else if (isProd && jwtSecret.length < 32) {
  throw new Error('FATAL: JWT_SECRET must be at least 32 characters in production.');
}

export const config = {
  nodeEnv: NODE_ENV,
  isProd,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@aura-tech.corp',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  cfTurnstileSecret: process.env.CF_TURNSTILE_SECRET || ''
};
