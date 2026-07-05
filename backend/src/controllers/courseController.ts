import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Course from "../models/Course";
import Section from "../models/Section";
import Lesson from "../models/Lesson";
import Video from "../models/Video";
import Enrollment from "../models/Enrollment";
import Progress from "../models/Progress";
import { AuthRequest } from "../middlewares/authMiddleware";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// @route  GET /api/courses (public - published only; admin sees all via ?all=true)
export const getCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "12", 10);
  const { search, category, difficulty, sort, all } = req.query;

  const filter: any = {};
  const isAdminRequest = req.user?.role === "admin" && all === "true";
  if (!isAdminRequest) filter.isPublished = true;

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$text = { $search: search as string };

  let sortOption: any = { createdAt: -1 };
  if (sort === "popular") sortOption = { totalEnrollments: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "latest") sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name avatar")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Courses fetched", courses, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// @route  GET /api/courses/featured|popular|latest (homepage sections)
export const getHomepageCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [featured, popular, latest] = await Promise.all([
    Course.find({ isPublished: true }).sort({ rating: -1 }).limit(6),
    Course.find({ isPublished: true }).sort({ totalEnrollments: -1 }).limit(6),
    Course.find({ isPublished: true }).sort({ createdAt: -1 }).limit(6),
  ]);
  ApiResponse.success(res, "Homepage courses fetched", { featured, popular, latest });
});

// @route  GET /api/courses/:slug
export const getCourseBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate("instructor", "name avatar bio");
  if (!course) throw new ApiError(404, "Course not found");

  if (!course.isPublished && req.user?.role !== "admin") {
    throw new ApiError(404, "Course not found");
  }

  const sections = await Section.find({ course: course._id }).sort({ order: 1 });
  const sectionIds = sections.map((s) => s._id);
  const lessons = await Lesson.find({ section: { $in: sectionIds } }).sort({ order: 1 });
  const lessonIds = lessons.map((l) => l._id);

  let isEnrolled = false;
  if (req.user?.role === "student") {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id, status: "active" });
    isEnrolled = !!enrollment;
  }

  // Only reveal video contents for preview videos or if enrolled/admin
  const videoFilter: any = { section: { $in: sectionIds } };
  if (!isEnrolled && req.user?.role !== "admin") videoFilter.accessType = "preview";
  const videos = await Video.find(videoFilter).sort({ order: 1 });

  const structure = sections.map((section) => ({
    ...section.toObject(),
    lessons: lessons
      .filter((l) => l.section.toString() === section._id.toString())
      .map((lesson) => ({
        ...lesson.toObject(),
        videos: videos.filter((v) => v.lesson.toString() === lesson._id.toString()),
      })),
  }));

  ApiResponse.success(res, "Course fetched", { course, structure, isEnrolled });
});

// @route  POST /api/courses
// @access Private/Admin
export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body;
  let slug = slugify(body.title);

  const existingSlug = await Course.findOne({ slug });
  if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const course = await Course.create({ ...body, slug, instructor: body.instructor || req.user._id });
  ApiResponse.success(res, "Course created", course, 201);
});

// @route  PUT /api/courses/:id
// @access Private/Admin
export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const body = { ...req.body };
  if (body.title && body.title !== course.title) {
    let newSlug = slugify(body.title);
    const clash = await Course.findOne({ slug: newSlug, _id: { $ne: course._id } });
    if (clash) newSlug = `${newSlug}-${Date.now().toString().slice(-5)}`;
    body.slug = newSlug;
  }

  Object.assign(course, body);
  await course.save();
  ApiResponse.success(res, "Course updated", course);
});

// @route  DELETE /api/courses/:id
// @access Private/Admin
export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const sections = await Section.find({ course: course._id });
  const sectionIds = sections.map((s) => s._id);
  const lessons = await Lesson.find({ section: { $in: sectionIds } });
  const lessonIds = lessons.map((l) => l._id);

  await Promise.all([
    Video.deleteMany({ course: course._id }),
    Lesson.deleteMany({ section: { $in: sectionIds } }),
    Section.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    Progress.deleteMany({ course: course._id }),
    course.deleteOne(),
  ]);

  ApiResponse.success(res, "Course and all related content deleted");
});

// @route  PUT /api/courses/:id/publish
// @access Private/Admin
export const togglePublish = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  course.isPublished = !course.isPublished;
  await course.save();

  ApiResponse.success(res, `Course ${course.isPublished ? "published" : "unpublished"}`, course);
});
