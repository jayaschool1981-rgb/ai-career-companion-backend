const rateLimitMap = new Map();

/**
 * In-memory rate limiting middleware
 * @param {number} limit - Maximum requests allowed per window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 */
export const rateLimiter = (limit = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip).filter(time => now - time < windowMs);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    if (timestamps.length > limit) {
      return res.status(429).json({
        success: false,
        message: "Too many connections from this IP. Please throttle your neural link (limit: 10/min)."
      });
    }

    next();
  };
};
