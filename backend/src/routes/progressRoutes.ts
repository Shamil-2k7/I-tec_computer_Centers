import { Router } from "express";
import {
  getProgress, markVideoComplete, updateResumePosition, toggleBookmark,
} from "../controllers/progressController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/:courseId", protect, authorize("student"), getProgress);
router.post("/video-complete", protect, authorize("student"), markVideoComplete);
router.put("/resume", protect, authorize("student"), updateResumePosition);
router.put("/bookmark", protect, authorize("student"), toggleBookmark);

export default router;
