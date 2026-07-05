import { Router } from "express";
import {
  getCourses, getHomepageCourses, getCourseBySlug,
  createCourse, updateCourse, deleteCourse, togglePublish,
} from "../controllers/courseController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Public / optionally-authenticated routes should attach user if a token exists;
// simplest here: keep these open to public, admin-only extras behind protect.
router.get("/", getCourses);
router.get("/homepage-sections", getHomepageCourses);
router.get("/:slug", getCourseBySlug);

router.post("/", protect, authorize("admin"), createCourse);
router.put("/:id", protect, authorize("admin"), updateCourse);
router.delete("/:id", protect, authorize("admin"), deleteCourse);
router.put("/:id/publish", protect, authorize("admin"), togglePublish);

export default router;
