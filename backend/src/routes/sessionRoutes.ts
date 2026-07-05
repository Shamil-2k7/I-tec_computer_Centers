import { Router } from "express";
import {
  getMySessions, removeMySession, removeAllMySessions,
  getUserSessions, getAllSessions, removeSession, removeAllUserSessions,
} from "../controllers/sessionController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/me", protect, getMySessions);
router.delete("/me/:sessionId", protect, removeMySession);
router.delete("/me", protect, removeAllMySessions);

router.get("/", protect, authorize("admin"), getAllSessions);
router.get("/user/:userId", protect, authorize("admin"), getUserSessions);
router.delete("/user/:userId", protect, authorize("admin"), removeAllUserSessions);
router.delete("/:sessionId", protect, authorize("admin"), removeSession);

export default router;
