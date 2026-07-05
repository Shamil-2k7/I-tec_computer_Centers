import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/apiResponse";
import User from "../models/User";
import Session from "../models/Session";

export interface AuthRequest extends Request {
  user?: any;
  sessionId?: string;
}

/**
 * Verifies the Bearer access token, loads the user, and confirms
 * the originating session (device) is still active. This is what
 * lets the admin "remove session" / "logout all devices" actions
 * immediately invalidate a logged-in device.
 */
export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Not authorized, token invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Not authorized, user not found or deactivated");
  }

  if (decoded.sessionId) {
    const session = await Session.findById(decoded.sessionId);
    if (!session || !session.isActive) {
      throw new ApiError(401, "Session has been terminated. Please log in again.");
    }
    session.lastActivity = new Date();
    await session.save();
    req.sessionId = decoded.sessionId;
  }

  req.user = user;
  next();
});
