import Session from "../models/Session.js";
import User from "../models/User.js";
import { sendEmail, emailTemplates } from "../lib/email.js";
import { createNotification } from "./notificationController.js";
import { ENV } from "../lib/env.js";

// Schedule a new interview
export async function scheduleInterview(req, res) {
  try {
    const {
      problem,
      difficulty,
      candidateEmail,
      scheduledStartTime,
      duration,
      title,
      description,
    } = req.body;

    const interviewerId = req.user._id;

    // Validation
    if (!problem || !difficulty || !candidateEmail || !scheduledStartTime) {
      return res.status(400).json({
        message: "Problem, difficulty, candidate email, and scheduled time are required",
      });
    }

    const startTime = new Date(scheduledStartTime);
    const endTime = new Date(startTime.getTime() + (duration || 60) * 60000);

    // Check if interviewer is trying to schedule in the past
    if (startTime < new Date()) {
      return res.status(400).json({ message: "Cannot schedule interview in the past" });
    }

    // Find candidate by email
    const candidate = await User.findOne({ email: candidateEmail });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found. They must be registered first." });
    }

    if (candidate._id.toString() === interviewerId.toString()) {
      return res.status(400).json({ message: "Cannot schedule interview with yourself" });
    }

    // Check for scheduling conflicts
    const conflicts = await Session.find({
      $or: [
        { interviewer: interviewerId },
        { candidate: candidate._id },
      ],
      status: "scheduled",
      $or: [
        {
          scheduledStartTime: { $lte: endTime },
          scheduledEndTime: { $gte: startTime },
        },
      ],
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "Scheduling conflict detected. Please choose a different time.",
      });
    }

    // Generate call ID
    const callId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create scheduled session
    const session = await Session.create({
      problem,
      difficulty,
      host: interviewerId,
      interviewer: interviewerId,
      candidate: candidate._id,
      participant: candidate._id,
      sessionType: "scheduled",
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      duration: duration || 60,
      title: title || `Interview: ${problem}`,
      description: description || "",
      status: "scheduled",
      callId,
    });

    // Send email to candidate
    const joinUrl = `${ENV.CLIENT_URL}/session/${session.meetingCode}`;
    const emailContent = {
      subject: `Interview Scheduled: ${title || problem}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .meeting-code { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .time-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Interview Scheduled</h1>
            </div>
            <div class="content">
              <p>Hi ${candidate.name}!</p>
              <p><strong>${req.user.name}</strong> has scheduled an interview with you.</p>
              
              <div class="time-box">
                <p><strong>⏰ Scheduled Time:</strong></p>
                <p style="font-size: 18px; margin: 5px 0;">${startTime.toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</p>
                <p><strong>Duration:</strong> ${duration || 60} minutes</p>
              </div>

              <div class="details">
                <p><strong>📝 Problem:</strong> ${problem}</p>
                <p><strong>⚡ Difficulty:</strong> <span style="text-transform: capitalize;">${difficulty}</span></p>
                ${description ? `<p><strong>📋 Description:</strong> ${description}</p>` : ''}
              </div>

              <p><strong>Meeting Code:</strong></p>
              <div class="meeting-code">${session.meetingCode}</div>

              <p>Join the interview at the scheduled time:</p>
              <center>
                <a href="${joinUrl}" class="button">Join Interview</a>
              </center>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy and paste this link in your browser:<br>
                <a href="${joinUrl}">${joinUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Talent IQ. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Interview Scheduled: ${title || problem}

Hi ${candidate.name},

${req.user.name} has scheduled an interview with you.

Scheduled Time: ${startTime.toLocaleString()}
Duration: ${duration || 60} minutes

Problem: ${problem}
Difficulty: ${difficulty}
${description ? `Description: ${description}` : ''}

Meeting Code: ${session.meetingCode}

Join the interview: ${joinUrl}

© 2024 Talent IQ
      `,
    };

    await sendEmail({
      to: candidateEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Create notification for candidate
    await createNotification({
      userId: candidate._id,
      type: "meeting_invite",
      title: "Interview Scheduled",
      message: `${req.user.name} scheduled an interview with you for ${startTime.toLocaleString()}`,
      sessionId: session._id,
      actionUrl: `/session/${session.meetingCode}`,
    });

    res.status(201).json({
      session,
      message: "Interview scheduled successfully",
    });
  } catch (error) {
    console.error("Error in scheduleInterview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get scheduled interviews (for calendar view)
export async function getScheduledInterviews(req, res) {
  try {
    const userId = req.user._id;
    const { startDate, endDate, role } = req.query;

    const query = {
      sessionType: "scheduled",
      status: { $in: ["scheduled", "active"] },
    };

    // Filter by role
    if (role === "interviewer") {
      query.interviewer = userId;
    } else if (role === "candidate") {
      query.candidate = userId;
    } else {
      // Get all interviews where user is either interviewer or candidate
      query.$or = [{ interviewer: userId }, { candidate: userId }];
    }

    // Filter by date range
    if (startDate && endDate) {
      query.scheduledStartTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const interviews = await Session.find(query)
      .populate("interviewer", "name email profileImage")
      .populate("candidate", "name email profileImage")
      .sort({ scheduledStartTime: 1 });

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error in getScheduledInterviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update scheduled interview
export async function updateScheduledInterview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { scheduledStartTime, duration, title, description, notes } = req.body;

    const session = await Session.findById(id).populate("candidate interviewer");

    if (!session) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Only interviewer can update
    if (session.interviewer._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the interviewer can update this interview" });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({ message: "Can only update scheduled interviews" });
    }

    // Update fields
    if (scheduledStartTime) {
      const newStartTime = new Date(scheduledStartTime);
      if (newStartTime < new Date()) {
        return res.status(400).json({ message: "Cannot reschedule to past time" });
      }
      session.scheduledStartTime = newStartTime;
      session.scheduledEndTime = new Date(newStartTime.getTime() + (duration || session.duration) * 60000);
    }

    if (duration) session.duration = duration;
    if (title) session.title = title;
    if (description) session.description = description;
    if (notes !== undefined) session.notes = notes;

    await session.save();

    // Notify candidate of changes
    if (scheduledStartTime) {
      await createNotification({
        userId: session.candidate._id,
        type: "meeting_reminder",
        title: "Interview Rescheduled",
        message: `Your interview has been rescheduled to ${session.scheduledStartTime.toLocaleString()}`,
        sessionId: session._id,
        actionUrl: `/session/${session.meetingCode}`,
      });
    }

    res.status(200).json({ session, message: "Interview updated successfully" });
  } catch (error) {
    console.error("Error in updateScheduledInterview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Cancel scheduled interview
export async function cancelScheduledInterview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const session = await Session.findById(id).populate("candidate interviewer");

    if (!session) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Both interviewer and candidate can cancel
    const isInterviewer = session.interviewer._id.toString() === userId.toString();
    const isCandidate = session.candidate._id.toString() === userId.toString();

    if (!isInterviewer && !isCandidate) {
      return res.status(403).json({ message: "You don't have permission to cancel this interview" });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({ message: "Can only cancel scheduled interviews" });
    }

    session.status = "cancelled";
    if (reason) session.notes = `Cancelled: ${reason}`;
    await session.save();

    // Notify the other party
    const otherParty = isInterviewer ? session.candidate : session.interviewer;
    const cancelledBy = isInterviewer ? "interviewer" : "candidate";

    await createNotification({
      userId: otherParty._id,
      type: "session_ended",
      title: "Interview Cancelled",
      message: `The ${cancelledBy} has cancelled the interview scheduled for ${session.scheduledStartTime.toLocaleString()}${reason ? `: ${reason}` : ''}`,
      sessionId: session._id,
      actionUrl: `/dashboard`,
    });

    // Send email notification
    const emailContent = {
      subject: "Interview Cancelled",
      html: `
        <p>Hi ${otherParty.name},</p>
        <p>The interview scheduled for <strong>${session.scheduledStartTime.toLocaleString()}</strong> has been cancelled by the ${cancelledBy}.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact the ${cancelledBy} if you have any questions.</p>
      `,
      text: `Hi ${otherParty.name}, The interview scheduled for ${session.scheduledStartTime.toLocaleString()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    };

    await sendEmail({
      to: otherParty.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    res.status(200).json({ message: "Interview cancelled successfully" });
  } catch (error) {
    console.error("Error in cancelScheduledInterview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get upcoming interviews (next 7 days)
export async function getUpcomingInterviews(req, res) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const interviews = await Session.find({
      $or: [{ interviewer: userId }, { candidate: userId }],
      sessionType: "scheduled",
      status: "scheduled",
      scheduledStartTime: {
        $gte: now,
        $lte: nextWeek,
      },
    })
      .populate("interviewer", "name email profileImage")
      .populate("candidate", "name email profileImage")
      .sort({ scheduledStartTime: 1 })
      .limit(10);

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error in getUpcomingInterviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Start a scheduled interview
export async function startScheduledInterview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({ message: "Interview is not in scheduled status" });
    }

    // Check if user is part of this interview
    const isInterviewer = session.interviewer?.toString() === userId.toString();
    const isCandidate = session.candidate?.toString() === userId.toString();

    if (!isInterviewer && !isCandidate) {
      return res.status(403).json({ message: "You are not part of this interview" });
    }

    // Check if it's too early (more than 15 minutes before scheduled time)
    const now = new Date();
    const scheduledTime = new Date(session.scheduledStartTime);
    const fifteenMinutesBefore = new Date(scheduledTime.getTime() - 15 * 60000);

    if (now < fifteenMinutesBefore) {
      return res.status(400).json({
        message: "Interview can only be started 15 minutes before scheduled time",
      });
    }

    session.status = "active";
    session.actualStartTime = now;
    await session.save();

    res.status(200).json({ session, message: "Interview started successfully" });
  } catch (error) {
    console.error("Error in startScheduledInterview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
