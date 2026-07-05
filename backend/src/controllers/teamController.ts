import { Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResponse, ApiError } from "../utils/apiResponse";
import Team from "../models/Team";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getTeam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter = req.user?.role === "admin" ? {} : { isActive: true };
  const team = await Team.find(filter).sort({ order: 1 });
  ApiResponse.success(res, "Team fetched", team);
});

export const createTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await Team.create(req.body);
  ApiResponse.success(res, "Team member added", member, 201);
});

export const updateTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await Team.findById(req.params.id);
  if (!member) throw new ApiError(404, "Team member not found");
  Object.assign(member, req.body);
  await member.save();
  ApiResponse.success(res, "Team member updated", member);
});

export const deleteTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await Team.findById(req.params.id);
  if (!member) throw new ApiError(404, "Team member not found");
  await member.deleteOne();
  ApiResponse.success(res, "Team member removed");
});
