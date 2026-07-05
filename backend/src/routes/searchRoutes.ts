import { Router } from "express";
import { globalSearch } from "../controllers/searchController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();
// protect (but not role-restricted) so we know the requester's role for scoping results;
// unauthenticated users can still be supported by making protect optional if desired.
router.get("/", protect, globalSearch);
export default router;
