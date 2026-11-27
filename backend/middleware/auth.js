import jwt from 'jsonwebtoken';
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
 * Middleware: Requires a valid Bearer JWT and active user account.
 */
export function authenticateToken(db) {
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
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await db.findUserById(decoded.sub);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Account is inactive or no longer exists.' });
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please sign in again.' });
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
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await db.findUserById(decoded.sub);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignore invalid token in optional mode
    }
    next();
  };
}
