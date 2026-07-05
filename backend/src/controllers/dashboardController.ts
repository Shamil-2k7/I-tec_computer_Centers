import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/apiResponse";
import User from "../models/User";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import Session from "../models/Session";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  GET /api/dashboard/admin
// @access Private/Admin
export const getAdminDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [totalStudents, totalCourses, totalEnrollments, activeSessions, courses] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: "active" }),
    Session.countDocuments({ isActive: true }),
    Course.find(),
  ]);

  const revenue = courses.reduce((sum, c) => sum + (c.isFree ? 0 : c.price * c.totalEnrollments), 0);

  // Enrollments per month for the last 6 months (simple chart data)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const enrollmentsByMonth = await Enrollment.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const recentEnrollments = await Enrollment.find()
    .populate("student", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(10);

  const recentStudents = await User.find({ role: "student" }).sort({ createdAt: -1 }).limit(10);

  const topCourses = await Course.find().sort({ totalEnrollments: -1 }).limit(5);

  ApiResponse.success(res, "Admin dashboard data fetched", {
    stats: { totalStudents, totalCourses, totalEnrollments, activeSessions, revenue },
    enrollmentsByMonth,
    recentEnrollments,
    recentStudents,
    topCourses,
  });
});

// @route  GET /api/dashboard/student
// @access Private/Student
export const getStudentDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: "active" }).populate("course");
  ApiResponse.success(res, "Student dashboard data fetched", {
    totalEnrolled: enrollments.length,
    enrollments,
  });
});
