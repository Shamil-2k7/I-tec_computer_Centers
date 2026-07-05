import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import Video from "../models/Video";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/sections/course/:courseId
export const getSectionsByCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sections = await Section.find({ course: req.params.courseId }).sort({ order: 1 });
  ApiResponse.success(res, "Sections fetched", sections);
});

// @route  POST /api/sections
// @access Private/Admin
export const createSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { course, title, order } = req.body;

  const count = await Section.countDocuments({ course });
  const section = await Section.create({ course, title, order: order ?? count });

  ApiResponse.success(res, "Section created", section, 201);
});

// @route  PUT /api/sections/:id
// @access Private/Admin
export const updateSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await Section.findById(req.params.id);
  if (!section) throw new ApiError(404, "Section not found");

  Object.assign(section, req.body);
  await section.save();
  ApiResponse.success(res, "Section updated", section);
});

// @route  DELETE /api/sections/:id
// @access Private/Admin
export const deleteSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await Section.findById(req.params.id);
  if (!section) throw new ApiError(404, "Section not found");

  const lessons = await Lesson.find({ section: section._id });
  const lessonIds = lessons.map((l) => l._id);

  await Promise.all([
    Video.deleteMany({ section: section._id }),
    Lesson.deleteMany({ section: section._id }),
    section.deleteOne(),
  ]);

  ApiResponse.success(res, "Section and its lessons/videos deleted");
});

// @route  PUT /api/sections/reorder
// @access Private/Admin  body: { items: [{ id, order }] }
export const reorderSections = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items } = req.body;
  await Promise.all(items.map((item: any) => Section.findByIdAndUpdate(item.id, { order: item.order })));
  ApiResponse.success(res, "Sections reordered");
});
