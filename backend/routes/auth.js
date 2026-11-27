import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { hashPassword, verifyPassword, sanitizeUser } from '../utils/crypto.js';
import { authenticateToken, authorizeRoles, optionalAuth, signToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const loginSchema = z.object({
  email: z.string().email('Valid email is required').max(255),
  password: z.string().min(1, 'Password is required').max(128)
});

const registerSchema = z.object({
  email: z.string().email('Valid email is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  fullName: z.string().min(2, 'Full name is required').max(120),
  role: z.enum(['admin', 'staff', 'security']).default('staff'),
  staffId: z.string().max(64).optional().nullable()
});

export function createAuthRouter(db, options = {}) {
  const router = Router();
  const authLimiter = createRateLimiter({
    windowMs: 60_000,
    max: options.authRateLimitMax ?? 15,
    message: 'Too many authentication attempts. Please wait a minute and try again.'
  });

  // POST /api/auth/login
  router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);

    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      await db.createAuditLog({
        id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
        userEmail: email.toLowerCase(),
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth',
        ipAddress: req.ip
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = sanitizeUser(user);
    const token = signToken(safeUser);

    await db.createAuditLog({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      userId: safeUser.id,
      userEmail: safeUser.email,
      userRole: safeUser.role,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'auth',
      ipAddress: req.ip
    });

    res.json({ token, user: safeUser });
  });

  // POST /api/auth/register (Admin only, or first-time bootstrap when 0 users exist)
  router.post('/register', authLimiter, optionalAuth(db), validateBody(registerSchema), async (req, res) => {
    const existingUsers = await db.listUsers();
    const isBootstrap = existingUsers.length === 0;

    if (!isBootstrap) {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to create users.' });
      }
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Only administrators can create new accounts.' });
      }
    }

    const { email, password, fullName, role, staffId } = req.body;
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const assignedRole = isBootstrap ? 'admin' : role;
    const newUser = await db.createUser({
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      fullName,
      role: assignedRole,
      staffId: staffId || null
    });

    await db.createAuditLog({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.user?.id || newUser.id,
      userEmail: req.user?.email || newUser.email,
      userRole: req.user?.role || assignedRole,
      action: 'USER_CREATED',
      resource: `users/${newUser.id}`,
      details: { role: assignedRole },
      ipAddress: req.ip
    });

    const token = signToken(newUser);
    res.status(201).json({ user: newUser, token });
  });

  // GET /api/auth/me
  router.get('/me', authenticateToken(db), (req, res) => {
    res.json({ user: req.user });
  });

  // GET /api/auth/users (Admin only)
  router.get('/users', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const users = await db.listUsers();
    res.json(users);
  });

  return router;
}
