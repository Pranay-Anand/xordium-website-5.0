// Simple in-memory rate limiter for single-instance deployments.
// For distributed production, replace with Redis-backed limiter (e.g., rate-limit-redis).
const rateLimiters = new Map();

function createRateLimiter(maxRequests, windowMs, keyPrefix = "default") {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || "unknown"}`;
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const windowKey = `${key}:${windowStart}`;

    let attempts = rateLimiters.get(windowKey) || 0;
    attempts++;

    rateLimiters.set(windowKey, attempts);

    if (attempts > maxRequests) {
      return res.status(429).json({
        error: "Too many requests, please try again later.",
        retryAfter: Math.ceil((windowStart + windowMs - now) / 1000)
      });
    }

    // Set headers for rate limit info
    const remaining = Math.max(0, maxRequests - attempts);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil((windowStart + windowMs) / 1000));
    res.setHeader("Retry-After", Math.ceil((windowStart + windowMs - now) / 1000));

    next();
  };
}

// Export specific limiters for common endpoints
module.exports = {
  createRateLimiter,
  // Default limiters for common endpoints
  auth: createRateLimiter(5, 15 * 60 * 1000), // 5 auth attempts per 15min
  api: createRateLimiter(100, 60 * 1000), // 100 API calls per minute
  submit: createRateLimiter(3, 60 * 1000), // 3 submissions per minute (forms)
};