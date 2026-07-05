import { Router } from "express";
import { getAdminDashboard, getStudentDashboard } from "../controllers/dashboardController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/student", protect, authorize("student"), getStudentDashboard);
export default router;
