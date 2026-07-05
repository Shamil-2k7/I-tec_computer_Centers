import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiResponse";

/** Runs after express-validator chains; throws a 400 ApiError with all messages if any fail. */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      "Validation failed",
      errors.array().map((e: any) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};
