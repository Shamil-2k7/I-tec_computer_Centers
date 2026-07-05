import { Router } from "express";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "../controllers/faqController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", getFAQs);
router.post("/", protect, authorize("admin"), createFAQ);
router.put("/:id", protect, authorize("admin"), updateFAQ);
router.delete("/:id", protect, authorize("admin"), deleteFAQ);
export default router;
