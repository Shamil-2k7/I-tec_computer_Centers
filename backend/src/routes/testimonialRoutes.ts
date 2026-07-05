import { Router } from "express";
import {
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} from "../controllers/testimonialController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", getTestimonials);
router.post("/", protect, authorize("admin"), createTestimonial);
router.put("/:id", protect, authorize("admin"), updateTestimonial);
router.delete("/:id", protect, authorize("admin"), deleteTestimonial);
export default router;
