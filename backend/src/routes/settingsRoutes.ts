import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", protect, authorize("admin"), getSettings);
router.put("/", protect, authorize("admin"), updateSettings);
export default router;
