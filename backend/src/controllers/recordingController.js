import Session from "../models/Session.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create recordings directory if it doesn't exist
const recordingsDir = path.join(__dirname, "../../recordings");
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

export const uploadRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration } = req.body;

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is authorized (host or participant)
    const userId = req.user._id.toString();
    const isAuthorized =
      session.host.toString() === userId ||
      session.participant?.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to upload recording" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No recording file provided" });
    }

    // Save file info to session
    const recordingPath = `/recordings/${req.file.filename}`;
    const recordingSize = req.file.size;

    session.recording = {
      path: recordingPath,
      filename: req.file.filename,
      size: recordingSize,
      duration: parseInt(duration) || 0,
      uploadedAt: new Date(),
      uploadedBy: userId,
    };

    await session.save();

    res.status(200).json({
      message: "Recording uploaded successfully",
      recording: {
        path: recordingPath,
        size: recordingSize,
        duration: duration,
      },
    });
  } catch (error) {
    console.error("Error uploading recording:", error);
    res.status(500).json({ message: "Failed to upload recording" });
  }
};

export const getRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is authorized
    const userId = req.user._id.toString();
    const isAuthorized =
      session.host.toString() === userId ||
      session.participant?.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to view recording" });
    }

    if (!session.recording || !session.recording.filename) {
      return res.status(404).json({ message: "No recording available" });
    }

    const filePath = path.join(recordingsDir, session.recording.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Recording file not found" });
    }

    // Stream the video file
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for video seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/webm",
      });

      file.pipe(res);
    } else {
      // Send entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/webm",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error("Error getting recording:", error);
    res.status(500).json({ message: "Failed to get recording" });
  }
};

export const deleteRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Only host can delete recording
    const userId = req.user._id.toString();
    if (session.host.toString() !== userId) {
      return res.status(403).json({ message: "Only host can delete recording" });
    }

    if (!session.recording || !session.recording.filename) {
      return res.status(404).json({ message: "No recording to delete" });
    }

    // Delete file
    const filePath = path.join(recordingsDir, session.recording.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from session
    session.recording = undefined;
    await session.save();

    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ message: "Failed to delete recording" });
  }
};

export const getRecordingInfo = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate("host", "name email")
      .populate("participant", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is authorized
    const userId = req.user._id.toString();
    const isAuthorized =
      session.host._id.toString() === userId ||
      session.participant?._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!session.recording) {
      return res.status(404).json({ message: "No recording available" });
    }

    res.status(200).json({
      recording: {
        ...session.recording.toObject(),
        sessionInfo: {
          problem: session.problem,
          difficulty: session.difficulty,
          host: session.host.name,
          participant: session.participant?.name,
          createdAt: session.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error getting recording info:", error);
    res.status(500).json({ message: "Failed to get recording info" });
  }
};
