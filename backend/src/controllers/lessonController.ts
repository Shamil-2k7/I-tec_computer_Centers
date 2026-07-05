import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Lesson from "../models/Lesson";
import Section from "../models/Section";
import Video from "../models/Video";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/lessons/section/:sectionId
export const getLessonsBySection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lessons = await Lesson.find({ section: req.params.sectionId }).sort({ order: 1 });
  ApiResponse.success(res, "Lessons fetched", lessons);
});

// @route  POST /api/lessons
// @access Private/Admin
export const createLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { section, title, description, order } = req.body;

  const sectionDoc = await Section.findById(section);
  if (!sectionDoc) throw new ApiError(404, "Section not found");

  const count = await Lesson.countDocuments({ section });
  const lesson = await Lesson.create({
    section,
    course: sectionDoc.course,
    title,
    description,
    order: order ?? count,
  });

  ApiResponse.success(res, "Lesson created", lesson, 201);
});

// @route  PUT /api/lessons/:id
// @access Private/Admin
export const updateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new ApiError(404, "Lesson not found");

  Object.assign(lesson, req.body);
  await lesson.save();
  ApiResponse.success(res, "Lesson updated", lesson);
});

// @route  DELETE /api/lessons/:id
// @access Private/Admin
export const deleteLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new ApiError(404, "Lesson not found");

  await Promise.all([Video.deleteMany({ lesson: lesson._id }), lesson.deleteOne()]);

  ApiResponse.success(res, "Lesson and its videos deleted");
});

// @route  PUT /api/lessons/reorder
// @access Private/Admin
export const reorderLessons = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items } = req.body;
  await Promise.all(items.map((item: any) => Lesson.findByIdAndUpdate(item.id, { order: item.order })));
  ApiResponse.success(res, "Lessons reordered");
});
