import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import Session from "../models/Session";
import Progress from "../models/Progress";
import { AuthRequest } from "../middlewares/authMiddleware";

// @route  PUT /api/users/profile
// @access Private - update own profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  ApiResponse.success(res, "Profile updated", user);
});

// @route  GET /api/users (admin - list/search students)
// @access Private/Admin
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "20", 10);
  const { search, role, isActive } = req.query;

  const filter: any = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search as string, $options: "i" } },
      { email: { $regex: search as string, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  ApiResponse.success(res, "Users fetched", users, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// @route  GET /api/users/:id
// @access Private/Admin
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const [enrollments, progress] = await Promise.all([
    Enrollment.find({ student: user._id }).populate("course", "title thumbnail"),
    Progress.find({ student: user._id }),
  ]);

  ApiResponse.success(res, "User fetched", { user, enrollments, progress });
});

// @route  POST /api/users (admin - create student or admin account)
// @access Private/Admin
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const user = await User.create({ name, email, password, role: role || "student" });
  ApiResponse.success(res, "User created", user, 201);
});

// @route  PUT /api/users/:id (admin - edit any user)
// @access Private/Admin
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone, role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  ApiResponse.success(res, "User updated", user);
});

// @route  DELETE /api/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await Promise.all([
    user.deleteOne(),
    Enrollment.deleteMany({ student: user._id }),
    Session.deleteMany({ user: user._id }),
    Progress.deleteMany({ student: user._id }),
  ]);

  ApiResponse.success(res, "User deleted");
});

// @route  PUT /api/users/:id/deactivate
// @access Private/Admin
export const toggleUserActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = !user.isActive;
  await user.save();

  if (!user.isActive) {
    await Session.updateMany({ user: user._id }, { isActive: false });
  }

  ApiResponse.success(res, `User ${user.isActive ? "activated" : "deactivated"}`, user);
});
