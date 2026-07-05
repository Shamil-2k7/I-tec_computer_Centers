import { Router } from "express";
import {
  getSectionsByCourse, createSection, updateSection, deleteSection, reorderSections,
} from "../controllers/sectionController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/course/:courseId", getSectionsByCourse);
router.post("/", protect, authorize("admin"), createSection);
router.put("/reorder", protect, authorize("admin"), reorderSections);
router.put("/:id", protect, authorize("admin"), updateSection);
router.delete("/:id", protect, authorize("admin"), deleteSection);

export default router;
