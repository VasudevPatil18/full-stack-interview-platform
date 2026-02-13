import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminRoute } from "../middleware/adminRoute.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllSessions,
  forceEndSession,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protectRoute, adminRoute);

// Dashboard stats
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Session management
router.get("/sessions", getAllSessions);
router.post("/sessions/:id/end", forceEndSession);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
