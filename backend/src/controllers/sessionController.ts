import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Session from "../models/Session";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/sessions/me
// @access Private (student - view own devices)
export const getMySessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await Session.find({ user: req.user._id, isActive: true }).sort({ lastActivity: -1 });
  ApiResponse.success(res, "Devices fetched", sessions);
});

// @route  DELETE /api/sessions/me/:sessionId
// @access Private (student - log out one of their own devices)
export const removeMySession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });
  if (!session) throw new ApiError(404, "Session not found");
  session.isActive = false;
  await session.save();
  ApiResponse.success(res, "Device logged out");
});

// @route  DELETE /api/sessions/me
// @access Private (student - log out of all devices)
export const removeAllMySessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Session.updateMany({ user: req.user._id }, { isActive: false });
  ApiResponse.success(res, "Logged out of all devices");
});

// @route  GET /api/sessions/user/:userId
// @access Private/Admin - view all devices for any student
export const getUserSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await Session.find({ user: req.params.userId }).sort({ lastActivity: -1 });
  ApiResponse.success(res, "User sessions fetched", sessions);
});

// @route  GET /api/sessions
// @access Private/Admin - view all active sessions platform-wide
export const getAllSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "20", 10);

  const filter: any = {};
  if (req.query.active === "true") filter.isActive = true;

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .populate("user", "name email role")
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Session.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Sessions fetched", sessions, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// @route  DELETE /api/sessions/:sessionId
// @access Private/Admin - force-remove any single session
export const removeSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await Session.findById(req.params.sessionId);
  if (!session) throw new ApiError(404, "Session not found");
  session.isActive = false;
  await session.save();
  ApiResponse.success(res, "Session removed");
});

// @route  DELETE /api/sessions/user/:userId
// @access Private/Admin - force logout all devices for a student
export const removeAllUserSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Session.updateMany({ user: req.params.userId }, { isActive: false });
  ApiResponse.success(res, "All devices logged out for this user");
});
