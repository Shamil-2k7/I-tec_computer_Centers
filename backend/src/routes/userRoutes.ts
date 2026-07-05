import { Router } from "express";
import {
  updateProfile, getUsers, getUserById, createUser,
  updateUser, deleteUser, toggleUserActive,
} from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.put("/profile", protect, updateProfile);

router.get("/", protect, authorize("admin"), getUsers);
router.post("/", protect, authorize("admin"), createUser);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.put("/:id/toggle-active", protect, authorize("admin"), toggleUserActive);

export default router;
