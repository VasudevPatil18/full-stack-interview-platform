import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  scheduleInterview,
  getScheduledInterviews,
  updateScheduledInterview,
  cancelScheduledInterview,
  getUpcomingInterviews,
  startScheduledInterview,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.post("/", protectRoute, scheduleInterview);
router.get("/", protectRoute, getScheduledInterviews);
router.get("/upcoming", protectRoute, getUpcomingInterviews);
router.patch("/:id", protectRoute, updateScheduledInterview);
router.delete("/:id", protectRoute, cancelScheduledInterview);
router.post("/:id/start", protectRoute, startScheduledInterview);

export default router;
