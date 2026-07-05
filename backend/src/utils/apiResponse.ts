/**
 * Standardized API response helpers so every endpoint returns
 * a consistent shape: { success, message, data, meta }.
 */
export class ApiResponse {
  static success(res: any, message: string, data: any = null, statusCode = 200, meta: any = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  static error(res: any, message: string, statusCode = 500, errors: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}

export class ApiError extends Error {
  statusCode: number;
  errors: any;

  constructor(statusCode: number, message: string, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
