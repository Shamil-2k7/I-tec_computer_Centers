import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

/** Stricter limiter for auth endpoints to slow down brute force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
