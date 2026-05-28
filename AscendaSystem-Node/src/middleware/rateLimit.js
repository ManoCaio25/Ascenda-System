import { HttpError } from "../utils/httpError.js";

export function createRateLimiter({ windowMs, max, label }) {
  const buckets = new Map();

  return function rateLimiter(req, _res, next) {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${label}:${ip}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;

    if (current.count > max) {
      next(new HttpError(429, "Too many requests. Try again later."));
      return;
    }

    next();
  };
}
