import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import User from "../models/User";
import Progress from "../models/Progress";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/enrollments
// @access Private/Admin
export const getEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "20", 10);
  const { student, course, status } = req.query;

  const filter: any = {};
  if (student) filter.student = student;
  if (course) filter.course = course;
  if (status) filter.status = status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "name email avatar")
      .populate("course", "title thumbnail")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Enrollments fetched", enrollments, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// @route  GET /api/enrollments/my
// @access Private/Student
export const getMyEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: "active" })
    .populate("course")
    .sort({ createdAt: -1 });

  const progressList = await Progress.find({
    student: req.user._id,
    course: { $in: enrollments.map((e) => e.course) },
  });

  const withProgress = enrollments.map((e) => {
    const p = progressList.find((pr) => pr.course.toString() === (e.course as any)._id.toString());
    return { ...e.toObject(), progress: p ? p.percentage : 0, isCompleted: p ? p.isCompleted : false };
  });

  ApiResponse.success(res, "Your enrollments fetched", withProgress);
});

// @route  POST /api/enrollments - single or multi-course enroll
// @access Private/Admin  body: { student, courses: [courseId, ...] }
export const enrollStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { student, courses } = req.body;

  const studentDoc = await User.findOne({ _id: student, role: "student" });
  if (!studentDoc) throw new ApiError(404, "Student not found");

  const courseIds: string[] = Array.isArray(courses) ? courses : [courses];
  const results: any[] = [];

  for (const courseId of courseIds) {
    const course = await Course.findById(courseId);
    if (!course) continue;

    const existing = await Enrollment.findOne({ student, course: courseId });
    if (existing) {
      existing.status = "active";
      await existing.save();
      results.push(existing);
    } else {
      const enrollment = await Enrollment.create({ student, course: courseId, enrolledBy: req.user._id });
      course.totalEnrollments += 1;
      await course.save();
      results.push(enrollment);
    }
  }

  ApiResponse.success(res, "Student enrolled successfully", results, 201);
});

// @route  POST /api/enrollments/bulk - many students, many courses
// @access Private/Admin  body: { students: [id], courses: [id] }
export const bulkEnroll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { students, courses } = req.body;
  let created = 0;

  for (const studentId of students) {
    for (const courseId of courses) {
      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing) {
        if (existing.status !== "active") {
          existing.status = "active";
          await existing.save();
        }
        continue;
      }
      await Enrollment.create({ student: studentId, course: courseId, enrolledBy: req.user._id });
      await Course.findByIdAndUpdate(courseId, { $inc: { totalEnrollments: 1 } });
      created++;
    }
  }

  ApiResponse.success(res, `Bulk enrollment complete. ${created} new enrollments created.`, { created }, 201);
});

// @route  PUT /api/enrollments/:id
// @access Private/Admin
export const updateEnrollment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw new ApiError(404, "Enrollment not found");

  Object.assign(enrollment, req.body);
  await enrollment.save();
  ApiResponse.success(res, "Enrollment updated", enrollment);
});

// @route  DELETE /api/enrollments/:id - remove enrollment
// @access Private/Admin
export const removeEnrollment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw new ApiError(404, "Enrollment not found");

  await Promise.all([
    enrollment.deleteOne(),
    Progress.deleteOne({ student: enrollment.student, course: enrollment.course }),
    Course.findByIdAndUpdate(enrollment.course, { $inc: { totalEnrollments: -1 } }),
  ]);

  ApiResponse.success(res, "Enrollment removed");
});

// @route  PUT /api/enrollments/transfer - move a student's enrollment from one course to another
// @access Private/Admin  body: { enrollmentId, newCourseId }
export const transferStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId, newCourseId } = req.body;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new ApiError(404, "Enrollment not found");

  const newCourse = await Course.findById(newCourseId);
  if (!newCourse) throw new ApiError(404, "Target course not found");

  const oldCourseId = enrollment.course;
  enrollment.course = newCourseId;
  await enrollment.save();

  await Promise.all([
    Course.findByIdAndUpdate(oldCourseId, { $inc: { totalEnrollments: -1 } }),
    Course.findByIdAndUpdate(newCourseId, { $inc: { totalEnrollments: 1 } }),
    Progress.deleteOne({ student: enrollment.student, course: oldCourseId }),
  ]);

  ApiResponse.success(res, "Student transferred to new course", enrollment);
});
