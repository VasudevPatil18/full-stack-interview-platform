import Session from "../models/Session.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { sendEmail, emailTemplates } from "../lib/email.js";
import { createNotification } from "./notificationController.js";
import { ENV } from "../lib/env.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, inviteEmail } = req.body;
    const userId = req.user._id;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for WebRTC
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    // Send email invite asynchronously (don't wait)
    if (inviteEmail) {
      const joinUrl = `${ENV.CLIENT_URL}/session/${session.meetingCode}`;
      const emailContent = emailTemplates.meetingInvite({
        hostName: req.user.name,
        problem,
        difficulty,
        meetingCode: session.meetingCode,
        joinUrl,
      });

      console.log('\n📧 Sending meeting invite email...');
      console.log('   To:', inviteEmail);
      console.log('   Meeting Code:', session.meetingCode);

      // Send email without waiting
      sendEmail({
        to: inviteEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }).then(result => {
        if (result.success) {
          console.log('✅ Meeting invite email sent successfully');
        } else if (result.skipped) {
          console.log('⚠️  Meeting invite email skipped:', result.reason);
          console.log('   Meeting Code:', session.meetingCode);
          console.log('   Join URL:', joinUrl);
        } else {
          console.log('❌ Meeting invite email failed:', result.error);
        }
      }).catch(err => console.log("Email error:", err.message));

      // Check if invited user exists and create notification (async)
      User.findOne({ email: inviteEmail }).then(invitedUser => {
        if (invitedUser) {
          createNotification({
            userId: invitedUser._id,
            type: "meeting_invite",
            title: "New Meeting Invitation",
            message: `${req.user.name} invited you to join a ${difficulty} coding session: ${problem}`,
            sessionId: session._id,
            actionUrl: `/session/${session.meetingCode}`,
          }).catch(err => console.log("Notification error:", err.message));
        }
      }).catch(err => console.log("User lookup error:", err.message));
    }

    // Return immediately
    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email")
      .populate("participant", "name profileImage email")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    // Try to find session by ID or meeting code
    const session = await Session.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { meetingCode: id.toUpperCase() }
      ]
    })
      .populate("host", "name email profileImage")
      .populate("participant", "name email profileImage");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Try to find session by ID or meeting code (without populate for speed)
    const session = await Session.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { meetingCode: id.toUpperCase() }
      ]
    });

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    // Update session
    session.participant = userId;
    await session.save();

    // Send notification asynchronously (don't wait for it)
    createNotification({
      userId: session.host,
      type: "session_joined",
      title: "Participant Joined",
      message: `${req.user.name} joined your coding session: ${session.problem}`,
      sessionId: session._id,
      actionUrl: `/session/${session._id}`,
    }).catch(err => console.log("Notification error:", err.message));

    // Return immediately
    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    session.status = "completed";
    await session.save();

    // Notify participant asynchronously (don't wait)
    if (session.participant) {
      createNotification({
        userId: session.participant,
        type: "session_ended",
        title: "Session Ended",
        message: `The coding session "${session.problem}" has ended`,
        sessionId: session._id,
        actionUrl: `/dashboard`,
      }).catch(err => console.log("Notification error:", err.message));
    }

    // Return immediately
    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Send meeting reminder
export async function sendMeetingReminder(req, res) {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const session = await Session.findById(id).populate("host", "name");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot send reminder for completed session" });
    }

    const joinUrl = `${ENV.CLIENT_URL}/session/${session.meetingCode}`;
    
    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    const recipientName = recipient ? recipient.name : "there";

    const emailContent = emailTemplates.meetingReminder({
      userName: recipientName,
      problem: session.problem,
      difficulty: session.difficulty,
      meetingCode: session.meetingCode,
      joinUrl,
      timeUntil: "soon",
    });

    console.log('\n📧 Sending meeting reminder email...');
    console.log('   To:', recipientEmail);
    console.log('   Meeting Code:', session.meetingCode);

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.success) {
      if (emailResult.skipped) {
        console.log('⚠️  Email skipped:', emailResult.reason);
        return res.status(200).json({ 
          message: "Reminder created but email not sent (SMTP not configured)",
          emailSkipped: true 
        });
      }
      return res.status(500).json({ 
        message: "Failed to send reminder email",
        error: emailResult.error 
      });
    }

    // Create notification if user exists
    if (recipient) {
      await createNotification({
        userId: recipient._id,
        type: "meeting_reminder",
        title: "Meeting Reminder",
        message: `Reminder: Coding session "${session.problem}" is waiting for you`,
        sessionId: session._id,
        actionUrl: `/session/${session.meetingCode}`,
      });
    }

    res.status(200).json({ message: "Reminder sent successfully" });
  } catch (error) {
    console.log("Error in sendMeetingReminder:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
