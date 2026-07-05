import { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

export interface DeviceRequest extends Request {
  deviceInfo?: {
    deviceId: string;
    browser: string;
    os: string;
    device: string;
    ip: string;
  };
}

/**
 * Parses the User-Agent header and either reuses a client-supplied
 * X-Device-Id header (so the same browser is recognized across logins)
 * or generates a new one.
 */
export const deviceParser = (req: DeviceRequest, res: Response, next: NextFunction) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const deviceId = (req.headers["x-device-id"] as string) || uuidv4();
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";

  req.deviceInfo = {
    deviceId,
    browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.type || "Desktop",
    ip,
  };

  next();
};
