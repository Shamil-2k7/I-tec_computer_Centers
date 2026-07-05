import { Router } from "express";
import { body } from "express-validator";
import {
  register, login, refresh, logout, getMe,
  forgotPassword, resetPassword, changePassword,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { deviceParser } from "../middlewares/deviceParser";
import { validate } from "../middlewares/validate";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  deviceParser,
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  login
);

router.post("/refresh", refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail()],
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("email").isEmail(),
    body("token").notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  resetPassword
);

router.put(
  "/change-password",
  protect,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 6 })],
  validate,
  changePassword
);

export default router;
