import { Response, NextFunction } from "express";
import { ApiError } from "../utils/apiResponse";
import { AuthRequest } from "./authMiddleware";

/**
 * Usage: router.get("/admin-only", protect, authorize("admin"), handler)
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "Not authorized");
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not allowed to access this resource`);
    }
    next();
  };
};
