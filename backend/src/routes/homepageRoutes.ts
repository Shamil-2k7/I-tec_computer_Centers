import { Router } from "express";
import { getHomepage, updateHomepage } from "../controllers/homepageController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/", getHomepage);
router.put("/", protect, authorize("admin"), updateHomepage);
export default router;
