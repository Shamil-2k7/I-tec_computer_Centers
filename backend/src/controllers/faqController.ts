import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import FAQ from "../models/FAQ";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getFAQs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter = req.user?.role === "admin" ? {} : { isActive: true };
  const faqs = await FAQ.find(filter).sort({ order: 1 });
  ApiResponse.success(res, "FAQs fetched", faqs);
});

export const createFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.create(req.body);
  ApiResponse.success(res, "FAQ added", faq, 201);
});

export const updateFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw new ApiError(404, "FAQ not found");
  Object.assign(faq, req.body);
  await faq.save();
  ApiResponse.success(res, "FAQ updated", faq);
});

export const deleteFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw new ApiError(404, "FAQ not found");
  await faq.deleteOne();
  ApiResponse.success(res, "FAQ removed");
});
