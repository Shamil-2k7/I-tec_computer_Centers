import { Router } from "express";
import { getTeam, createTeamMember, updateTeamMember, deleteTeamMember } from "../controllers/teamController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", getTeam);
router.post("/", protect, authorize("admin"), createTeamMember);
router.put("/:id", protect, authorize("admin"), updateTeamMember);
router.delete("/:id", protect, authorize("admin"), deleteTeamMember);
export default router;
