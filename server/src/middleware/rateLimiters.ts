import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 20,                   // 20 attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
  keyGenerator: (req) => req.ip || "unknown",
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded" },
  keyGenerator: (req) => req.ip || "unknown",
});
