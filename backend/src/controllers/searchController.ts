import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/apiResponse";
import Course from "../models/Course";
import User from "../models/User";
import Lesson from "../models/Lesson";
import Video from "../models/Video";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/search?q=...&scope=all|courses|students|lessons|videos
// @access Private/Admin for full scope, public for course-only search
export const globalSearch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string) || "";
  const scope = (req.query.scope as string) || "all";
  const regex = { $regex: q, $options: "i" };

  const results: any = {};

  if (scope === "all" || scope === "courses") {
    const courseFilter: any = { $or: [{ title: regex }, { category: regex }] };
    if (req.user?.role !== "admin") courseFilter.isPublished = true;
    results.courses = await Course.find(courseFilter).limit(10);
  }

  if ((scope === "all" || scope === "students") && req.user?.role === "admin") {
    results.students = await User.find({
      role: "student",
      $or: [{ name: regex }, { email: regex }],
    }).limit(10);
  }

  if ((scope === "all" || scope === "lessons") && req.user?.role === "admin") {
    results.lessons = await Lesson.find({ title: regex }).limit(10).populate("course", "title");
  }

  if ((scope === "all" || scope === "videos") && req.user?.role === "admin") {
    results.videos = await Video.find({ title: regex }).limit(10).populate("course", "title");
  }

  ApiResponse.success(res, "Search results", results);
});
