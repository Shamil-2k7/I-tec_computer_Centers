import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Video from "../models/Video";
import Lesson from "../models/Lesson";
import { toEmbedUrl, isValidYouTubeUrl } from "../utils/youtube";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/videos/lesson/:lessonId
export const getVideosByLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const videos = await Video.find({ lesson: req.params.lessonId }).sort({ order: 1 });
  ApiResponse.success(res, "Videos fetched", videos);
});

// @route  POST /api/videos
// @access Private/Admin - admin pastes a YouTube URL, embed is derived automatically
export const createVideo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lesson, title, youtubeUrl, duration, accessType, order } = req.body;

  if (!isValidYouTubeUrl(youtubeUrl)) {
    throw new ApiError(400, "Please provide a valid YouTube URL");
  }

  const lessonDoc = await Lesson.findById(lesson);
  if (!lessonDoc) throw new ApiError(404, "Lesson not found");

  const embedUrl = toEmbedUrl(youtubeUrl)!;
  const count = await Video.countDocuments({ lesson });

  const video = await Video.create({
    lesson,
    section: lessonDoc.section,
    course: lessonDoc.course,
    title,
    youtubeUrl,
    embedUrl,
    duration,
    accessType: accessType || "locked",
    order: order ?? count,
  });

  ApiResponse.success(res, "Video added", video, 201);
});

// @route  PUT /api/videos/:id
// @access Private/Admin
export const updateVideo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, "Video not found");

  const body = { ...req.body };
  if (body.youtubeUrl) {
    if (!isValidYouTubeUrl(body.youtubeUrl)) throw new ApiError(400, "Please provide a valid YouTube URL");
    body.embedUrl = toEmbedUrl(body.youtubeUrl);
  }

  Object.assign(video, body);
  await video.save();
  ApiResponse.success(res, "Video updated", video);
});

// @route  DELETE /api/videos/:id
// @access Private/Admin
export const deleteVideo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, "Video not found");
  await video.deleteOne();
  ApiResponse.success(res, "Video deleted");
});

// @route  PUT /api/videos/reorder
// @access Private/Admin
export const reorderVideos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items } = req.body;
  await Promise.all(items.map((item: any) => Video.findByIdAndUpdate(item.id, { order: item.order })));
  ApiResponse.success(res, "Videos reordered");
});
