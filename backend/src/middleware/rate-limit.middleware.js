import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: {
      code: "TOO_MANY_ATTEMPTS",
      message: "Too many login attempts. Please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});