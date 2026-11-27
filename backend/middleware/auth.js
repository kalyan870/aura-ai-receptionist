import jwt from 'jsonwebtoken';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { config } from '../config/env.js';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      staffId: user.staffId || null
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/**
 * Verifies a Bearer token against local JWT first, then Clerk JWKS if CLERK_SECRET_KEY is configured.
 */
async function resolveAuthenticatedUser(token, db, clerkVerifier = verifyClerkToken) {
  // 1. Try local application JWT
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await db.findUserById(decoded.sub);
    if (user && user.isActive) {
      return { ...user, authProvider: 'local-jwt' };
    }
    return null;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const expiredErr = new Error('Session expired. Please sign in again.');
      expiredErr.code = 'TOKEN_EXPIRED';
      throw expiredErr;
    }
  }

  // 2. Try Clerk JWT if configured
  if (config.clerkSecretKey) {
    try {
      const clerkClaims = await clerkVerifier(token, { secretKey: config.clerkSecretKey });
      const clerkId = clerkClaims.sub;
      const role = clerkClaims.public_metadata?.role || clerkClaims.metadata?.role || 'staff';
      const email = clerkClaims.email || `${clerkId}@clerk.local`;
      return {
        id: clerkId,
        clerkId,
        email,
        fullName: clerkClaims.full_name || email.split('@')[0],
        role: ['admin', 'staff', 'security'].includes(role) ? role : 'staff',
        staffId: clerkClaims.public_metadata?.staffId || null,
        isActive: true,
        authProvider: 'clerk'
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Middleware: Requires a valid Bearer JWT (local or Clerk) and active user account.
 */
export function authenticateToken(db, options = {}) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Empty token.' });
    }

    try {
      const user = await resolveAuthenticatedUser(token, db, options.clerkVerifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid authentication token or inactive account.' });
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.code === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: err.message });
      }
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }
  };
}

/**
 * Middleware: Enforces Role-Based Access Control (RBAC).
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}

/**
 * Middleware: Attaches req.user if valid Bearer token is present, otherwise continues anonymously.
 */
export function optionalAuth(db) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.slice(7).trim();
    try {
      const user = await resolveAuthenticatedUser(token, db);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore invalid token in optional mode
    }
    next();
  };
}
