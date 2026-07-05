import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/apiResponse";
import Settings from "../models/Settings";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  ApiResponse.success(res, "Settings fetched", settings);
});

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  ApiResponse.success(res, "Settings updated", settings);
});
