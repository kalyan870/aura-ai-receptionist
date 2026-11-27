import crypto from 'crypto';

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Hash a plaintext password using Node's built-in scrypt with a random 16-byte salt.
 * Format: scrypt$<saltHex>$<derivedKeyHex>
 */
export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

/**
 * Constant-time password verification to prevent timing side-channel attacks.
 */
export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  const derivedBuffer = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  if (derivedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

/**
 * Strip sensitive fields from user objects before returning to clients.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, password_hash, ...safeUser } = user;
  return safeUser;
}
