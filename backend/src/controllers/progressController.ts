import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Progress from "../models/Progress";
import Video from "../models/Video";
import Lesson from "../models/Lesson";
import Section from "../models/Section";
import Enrollment from "../models/Enrollment";
import { AuthRequest } from "../middlewares/authMiddleware";

const getOrCreateProgress = async (studentId: string, courseId: string) => {
  let progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) {
    progress = await Progress.create({ student: studentId, course: courseId });
  }
  return progress;
};

const recalculatePercentage = async (progress: any, courseId: string) => {
  const totalVideos = await Video.countDocuments({ course: courseId });
  if (totalVideos === 0) {
    progress.percentage = 0;
  } else {
    progress.percentage = Math.round((progress.completedVideos.length / totalVideos) * 100);
  }
  progress.isCompleted = progress.percentage >= 100;
  await progress.save();
};

// @route  GET /api/progress/:courseId
// @access Private/Student
export const getProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
    status: "active",
  });
  if (!enrollment) throw new ApiError(403, "You are not enrolled in this course");

  const progress = await getOrCreateProgress(req.user._id.toString(), req.params.courseId);
  ApiResponse.success(res, "Progress fetched", progress);
});

// @route  POST /api/progress/video-complete  body: { courseId, videoId }
// @access Private/Student
export const markVideoComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId, videoId } = req.body;

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId, status: "active" });
  if (!enrollment) throw new ApiError(403, "You are not enrolled in this course");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const progress = await getOrCreateProgress(req.user._id.toString(), courseId);

  if (!progress.completedVideos.some((id) => id.toString() === videoId)) {
    progress.completedVideos.push(videoId);
  }

  // Check whether this completes the lesson / section
  const lessonVideos = await Video.find({ lesson: video.lesson });
  const allLessonVideosDone = lessonVideos.every((v) =>
    progress.completedVideos.some((id) => id.toString() === v._id.toString())
  );
  if (allLessonVideosDone && !progress.completedLessons.some((id) => id.toString() === video.lesson.toString())) {
    progress.completedLessons.push(video.lesson);
  }

  const sectionLessons = await Lesson.find({ section: video.section });
  const allSectionLessonsDone = sectionLessons.every((l) =>
    progress.completedLessons.some((id) => id.toString() === l._id.toString())
  );
  if (allSectionLessonsDone && !progress.completedSections.some((id) => id.toString() === video.section.toString())) {
    progress.completedSections.push(video.section);
  }

  await recalculatePercentage(progress, courseId);

  ApiResponse.success(res, "Video marked as complete", progress);
});

// @route  PUT /api/progress/resume  body: { courseId, videoId, position }
// @access Private/Student
export const updateResumePosition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId, videoId, position } = req.body;

  const progress = await getOrCreateProgress(req.user._id.toString(), courseId);
  progress.lastWatchedVideo = videoId;
  progress.lastWatchedPosition = position;
  await progress.save();

  ApiResponse.success(res, "Resume position saved", progress);
});

// @route  PUT /api/progress/bookmark  body: { courseId, lessonId }
// @access Private/Student
export const toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId, lessonId } = req.body;

  const progress = await getOrCreateProgress(req.user._id.toString(), courseId);
  const idx = progress.bookmarkedLessons.findIndex((id) => id.toString() === lessonId);

  if (idx >= 0) {
    progress.bookmarkedLessons.splice(idx, 1);
  } else {
    progress.bookmarkedLessons.push(lessonId);
  }

  await progress.save();
  ApiResponse.success(res, "Bookmark updated", progress);
});
