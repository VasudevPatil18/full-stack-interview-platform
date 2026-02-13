import express from "express";
import multer from "multer";
import path from "path";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  uploadRecording,
  getRecording,
  deleteRecording,
  getRecordingInfo,
} from "../controllers/recordingController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "recordings/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `session-${req.params.sessionId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/webm", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only WebM and MP4 are allowed."));
    }
  },
});

// Upload recording
router.post("/:sessionId/recording", protectRoute, upload.single("recording"), uploadRecording);

// Get recording (stream video)
router.get("/:sessionId/recording", protectRoute, getRecording);

// Get recording info
router.get("/:sessionId/recording/info", protectRoute, getRecordingInfo);

// Delete recording
router.delete("/:sessionId/recording", protectRoute, deleteRecording);

export default router;
