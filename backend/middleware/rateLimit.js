/**
 * In-memory sliding-window rate limiter.
 */
export function createRateLimiter({ windowMs = 60_000, max = 60, message = 'Too many requests, please try again later.' } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const cutoff = now - windowMs;

    const timestamps = (hits.get(key) || []).filter(ts => ts > cutoff);
    if (timestamps.length >= max) {
      const retryAfterSec = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)));
      return res.status(429).json({ error: message });
    }

    timestamps.push(now);
    hits.set(key, timestamps);

    // Periodic cleanup when map grows
    if (hits.size > 5000) {
      for (const [k, arr] of hits.entries()) {
        const active = arr.filter(ts => ts > cutoff);
        if (active.length === 0) hits.delete(k);
        else hits.set(k, active);
      }
    }

    next();
  };
}
