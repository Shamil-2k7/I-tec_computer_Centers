import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiResponse";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Must be registered last. Handles ApiError instances thrown anywhere
 * (including inside asyncHandler-wrapped controllers), plus common
 * Mongoose errors (validation, cast, duplicate key).
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e: any) => e.message);
    message = "Validation failed";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
