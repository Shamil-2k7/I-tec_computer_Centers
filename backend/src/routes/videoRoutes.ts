import { Router } from "express";
import {
  getVideosByLesson, createVideo, updateVideo, deleteVideo, reorderVideos,
} from "../controllers/videoController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/lesson/:lessonId", protect, getVideosByLesson);
router.post("/", protect, authorize("admin"), createVideo);
router.put("/reorder", protect, authorize("admin"), reorderVideos);
router.put("/:id", protect, authorize("admin"), updateVideo);
router.delete("/:id", protect, authorize("admin"), deleteVideo);

export default router;
