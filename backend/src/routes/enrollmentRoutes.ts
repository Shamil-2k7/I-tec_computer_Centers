import { Router } from "express";
import {
  getEnrollments, getMyEnrollments, enrollStudent, bulkEnroll,
  updateEnrollment, removeEnrollment, transferStudent,
} from "../controllers/enrollmentController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/my", protect, authorize("student"), getMyEnrollments);

router.get("/", protect, authorize("admin"), getEnrollments);
router.post("/", protect, authorize("admin"), enrollStudent);
router.post("/bulk", protect, authorize("admin"), bulkEnroll);
router.put("/transfer", protect, authorize("admin"), transferStudent);
router.put("/:id", protect, authorize("admin"), updateEnrollment);
router.delete("/:id", protect, authorize("admin"), removeEnrollment);

export default router;
