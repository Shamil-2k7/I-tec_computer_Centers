import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Testimonial from "../models/Testimonial";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getTestimonials = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter = req.user?.role === "admin" ? {} : { isActive: true };
  const testimonials = await Testimonial.find(filter).sort({ order: 1 });
  ApiResponse.success(res, "Testimonials fetched", testimonials);
});

export const createTestimonial = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.create(req.body);
  ApiResponse.success(res, "Testimonial added", testimonial, 201);
});

export const updateTestimonial = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");
  Object.assign(testimonial, req.body);
  await testimonial.save();
  ApiResponse.success(res, "Testimonial updated", testimonial);
});

export const deleteTestimonial = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");
  await testimonial.deleteOne();
  ApiResponse.success(res, "Testimonial removed");
});
