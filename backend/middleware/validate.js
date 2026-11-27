import { ZodError } from 'zod';

/**
 * Strip HTML angle brackets and ASCII control chars from strings to prevent XSS/injection.
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Recursively sanitize strings in an object (skipping base64 data URLs like photo).
 */
export function sanitizePayload(obj, skipKeys = new Set(['photo', 'password'])) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item, skipKeys));
  }
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      if (skipKeys.has(k)) {
        clean[k] = v;
      } else {
        clean[k] = sanitizePayload(v, skipKeys);
      }
    }
    return clean;
  }
  return typeof obj === 'string' ? sanitizeString(obj) : obj;
}

/**
 * Express middleware that validates req.body using a Zod schema.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const sanitized = sanitizePayload(req.body || {});
      req.body = schema.parse(sanitized);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({
            field: e.path.join('.') || 'body',
            message: e.message
          }))
        });
      }
      next(err);
    }
  };
}
