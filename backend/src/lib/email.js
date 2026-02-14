import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create reusable transporter
const createTransporter = () => {
  // Check if SMTP is configured
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    console.log('⚠️  SMTP not configured. Emails will not be sent.');
    console.log('   Add SMTP settings to backend/.env to enable emails.');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: parseInt(ENV.SMTP_PORT) || 587,
      secure: ENV.SMTP_SECURE === "true",
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
      // Add timeout and connection settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter, SMTP is not configured
    if (!transporter) {
      console.log('📧 Email NOT sent (SMTP not configured):', { to, subject });
      console.log('   Configure SMTP in backend/.env to enable emails.');
      return { success: false, skipped: true, reason: 'SMTP not configured' };
    }

    const mailOptions = {
      from: ENV.SMTP_FROM || '"Talent IQ" <noreply@talentiq.com>',
      to,
      subject,
      html,
      text,
    };

    console.log('📧 Sending email to:', to);
    console.log('   Subject:', subject);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', to);
    
    // In development, log additional info
    if (ENV.NODE_ENV !== "production") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('   Preview URL:', previewUrl);
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   To:', to);
    console.error('   Subject:', subject);
    
    // Log specific error types
    if (error.code === 'EAUTH') {
      console.error('   → Authentication failed. Check SMTP_USER and SMTP_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   → Connection failed. Check SMTP_HOST and SMTP_PORT');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout. Check firewall/network settings');
    }
    
    return { success: false, error: error.message, code: error.code };
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
