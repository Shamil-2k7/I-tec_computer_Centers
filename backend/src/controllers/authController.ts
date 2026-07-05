import { Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendEmail, passwordResetTemplate } from "../utils/sendEmail";
import { env } from "../config/env";
import User from "../models/User";
import Session from "../models/Session";
import { AuthRequest } from "../middlewares/authMiddleware";
import { DeviceRequest } from "../middlewares/deviceParser";

type Req = AuthRequest & DeviceRequest;

/**
 * Creates a session for the given user/device, enforcing the
 * "max N devices" rule for students (admins are exempt).
 * If the device (by deviceId) already has a session, it's refreshed
 * instead of counted as a new one.
 */
const createSessionForLogin = async (user: any, deviceInfo: NonNullable<Req["deviceInfo"]>) => {
  const existing = await Session.findOne({ user: user._id, deviceId: deviceInfo.deviceId });

  if (!existing && user.role === "student") {
    const activeCount = await Session.countDocuments({ user: user._id, isActive: true });
    if (activeCount >= env.MAX_DEVICES_PER_STUDENT) {
      throw new ApiError(403, "Maximum login limit reached.");
    }
  }

  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);

  let session = existing;
  if (session) {
    session.isActive = true;
    session.lastActivity = new Date();
    session.ip = deviceInfo.ip;
    session.browser = deviceInfo.browser;
    session.os = deviceInfo.os;
  } else {
    session = new Session({
      user: user._id,
      deviceId: deviceInfo.deviceId,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      ip: deviceInfo.ip,
      refreshToken: "",
    });
  }

  const refreshToken = signRefreshToken({ ...payload, sessionId: session._id.toString() });
  session.refreshToken = refreshToken;
  await session.save();

  const accessTokenWithSession = signAccessToken({ ...payload, sessionId: session._id.toString() });

  return { accessToken: accessTokenWithSession, refreshToken, session };
};

// @route  POST /api/auth/register
// @access Public (registers a student account)
export const register = asyncHandler(async (req: Req, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password, role: "student" });

  ApiResponse.success(res, "Account created successfully. Please log in.", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }, 201);
});

// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req: Req, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "Your account has been deactivated. Contact support.");

  if (!req.deviceInfo) throw new ApiError(400, "Could not identify device");

  const { accessToken, refreshToken, session } = await createSessionForLogin(user, req.deviceInfo);

  ApiResponse.success(res, "Login successful", {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    accessToken,
    refreshToken,
    deviceId: req.deviceInfo.deviceId,
    sessionId: session._id,
  });
});

// @route  POST /api/auth/refresh
// @access Public (requires valid refresh token)
export const refresh = asyncHandler(async (req: Req, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token is required");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const session = await Session.findById(decoded.sessionId).select("+refreshToken");
  if (!session || !session.isActive || session.refreshToken !== refreshToken) {
    throw new ApiError(401, "Session is no longer valid. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, "User not found or deactivated");

  const payload = { id: user._id.toString(), role: user.role, sessionId: session._id.toString() };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  session.refreshToken = newRefreshToken;
  session.lastActivity = new Date();
  await session.save();

  ApiResponse.success(res, "Token refreshed", { accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// @route  POST /api/auth/logout
// @access Private
export const logout = asyncHandler(async (req: Req, res: Response) => {
  if (req.sessionId) {
    await Session.findByIdAndUpdate(req.sessionId, { isActive: false });
  }
  ApiResponse.success(res, "Logged out successfully");
});

// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req: Req, res: Response) => {
  ApiResponse.success(res, "Current user fetched", req.user);
});

// @route  POST /api/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req: Req, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return ApiResponse.success(res, "If that email exists, a reset link has been sent.");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60 * 1000);
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your AKM LMS password",
      html: passwordResetTemplate(user.name, resetUrl),
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new ApiError(500, "Could not send reset email. Please try again later.");
  }

  ApiResponse.success(res, "If that email exists, a reset link has been sent.");
});

// @route  POST /api/auth/reset-password
// @access Public
export const resetPassword = asyncHandler(async (req: Req, res: Response) => {
  const { email, token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Invalidate all existing sessions for security after a password reset
  await Session.updateMany({ user: user._id }, { isActive: false });

  ApiResponse.success(res, "Password has been reset. Please log in with your new password.");
});

// @route  PUT /api/auth/change-password
// @access Private
export const changePassword = asyncHandler(async (req: Req, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, "Password changed successfully");
});
