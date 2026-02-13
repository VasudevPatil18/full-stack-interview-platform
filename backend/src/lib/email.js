import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create reusable transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP service)
  // For production, use real SMTP service (Gmail, SendGrid, etc.)
  
  if (ENV.NODE_ENV === "production" && ENV.SMTP_HOST) {
    return nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT || 587,
      secure: ENV.SMTP_SECURE === "true",
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  }
  
  // Development mode - log to console
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: ENV.SMTP_USER || "test@example.com",
      pass: ENV.SMTP_PASS || "test",
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip email sending if SMTP is not configured in development
    if (ENV.NODE_ENV !== "production" && !ENV.SMTP_USER) {
      console.log("📧 Email skipped (SMTP not configured):", { to, subject });
      return { success: true, skipped: true };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: ENV.SMTP_FROM || '"Talent IQ" <noreply@talentiq.com>',
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent:", info.messageId);
    
    // In development, log the preview URL
    if (ENV.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw error - just log it and continue
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  meetingInvite: ({ hostName, problem, difficulty, meetingCode, joinUrl }) => ({
    subject: `${hostName} invited you to a coding session`,
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
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Coding Session Invitation</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p><strong>${hostName}</strong> has invited you to join a coding interview practice session.</p>
            
            <div class="details">
              <p><strong>📝 Problem:</strong> ${problem}</p>
              <p><strong>⚡ Difficulty:</strong> <span style="text-transform: capitalize;">${difficulty}</span></p>
            </div>

            <p><strong>Meeting Code:</strong></p>
            <div class="meeting-code">${meetingCode}</div>

            <p>Click the button below to join the session:</p>
            <center>
              <a href="${joinUrl}" class="button">Join Session Now</a>
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
${hostName} invited you to a coding session

Problem: ${problem}
Difficulty: ${difficulty}
Meeting Code: ${meetingCode}

Join the session: ${joinUrl}

© 2024 Talent IQ
    `,
  }),

  meetingReminder: ({ userName, problem, difficulty, meetingCode, joinUrl, timeUntil }) => ({
    subject: `Reminder: Coding session starting ${timeUntil}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .meeting-code { background: #f5576c; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Session Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${userName}!</p>
            
            <div class="alert">
              <strong>⏰ Your coding session is starting ${timeUntil}!</strong>
            </div>

            <div class="details">
              <p><strong>📝 Problem:</strong> ${problem}</p>
              <p><strong>⚡ Difficulty:</strong> <span style="text-transform: capitalize;">${difficulty}</span></p>
            </div>

            <p><strong>Meeting Code:</strong></p>
            <div class="meeting-code">${meetingCode}</div>

            <p>Click the button below to join:</p>
            <center>
              <a href="${joinUrl}" class="button">Join Session Now</a>
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
Reminder: Your coding session is starting ${timeUntil}!

Hi ${userName},

Problem: ${problem}
Difficulty: ${difficulty}
Meeting Code: ${meetingCode}

Join the session: ${joinUrl}

© 2024 Talent IQ
    `,
  }),

  passwordReset: ({ userName, resetUrl, expiresIn }) => ({
    subject: 'Reset Your Password - Talent IQ',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'}!</p>
            <p>We received a request to reset your password for your Talent IQ account.</p>
            
            <center>
              <a href="${resetUrl}" class="button">Reset Your Password</a>
            </center>

            <div class="warning">
              <strong>⏰ This link will expire in ${expiresIn}.</strong><br>
              This link can only be used once.
            </div>

            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
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
Password Reset Request

Hi ${userName || 'there'},

We received a request to reset your password for your Talent IQ account.

Reset your password by clicking this link:
${resetUrl}

This link will expire in ${expiresIn} and can only be used once.

If you didn't request a password reset, you can safely ignore this email.

© 2024 Talent IQ
    `,
  }),
};
