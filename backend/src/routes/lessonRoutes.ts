import { Router } from "express";
import {
  getLessonsBySection, createLesson, updateLesson, deleteLesson, reorderLessons,
} from "../controllers/lessonController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/section/:sectionId", getLessonsBySection);
router.post("/", protect, authorize("admin"), createLesson);
router.put("/reorder", protect, authorize("admin"), reorderLessons);
router.put("/:id", protect, authorize("admin"), updateLesson);
router.delete("/:id", protect, authorize("admin"), deleteLesson);

export default router;
