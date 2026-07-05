import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/apiResponse";
import Homepage from "../models/Homepage";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/homepage (public)
export const getHomepage = asyncHandler(async (req: AuthRequest, res: Response) => {
  let homepage = await Homepage.findOne();
  if (!homepage) homepage = await Homepage.create({});
  ApiResponse.success(res, "Homepage content fetched", homepage);
});

// @route  PUT /api/homepage
// @access Private/Admin
export const updateHomepage = asyncHandler(async (req: AuthRequest, res: Response) => {
  let homepage = await Homepage.findOne();
  if (!homepage) {
    homepage = await Homepage.create(req.body);
  } else {
    Object.assign(homepage, req.body);
    await homepage.save();
  }
  ApiResponse.success(res, "Homepage content updated", homepage);
});
