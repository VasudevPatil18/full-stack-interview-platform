import dotenv from 'dotenv';
import { sendEmail, emailTemplates } from './src/lib/email.js';

dotenv.config();

async function testEmail() {
  console.log('=== EMAIL CONFIGURATION TEST ===\n');
  
  console.log('SMTP Settings:');
  console.log('  Host:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('  Port:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('  User:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('  Pass:', process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('  From:', process.env.SMTP_FROM || '❌ NOT SET');
  console.log('  Node Env:', process.env.NODE_ENV || 'development');
  console.log('');

  if (!process.env.SMTP_USER) {
    console.log('⚠️  SMTP not configured. Emails will be skipped in development.');
    console.log('');
    console.log('To enable emails, add to backend/.env:');
    console.log('');
    console.log('For Gmail:');
    console.log('  SMTP_HOST=smtp.gmail.com');
    console.log('  SMTP_PORT=587');
    console.log('  SMTP_SECURE=false');
    console.log('  SMTP_USER=your_email@gmail.com');
    console.log('  SMTP_PASS=your_16_char_app_password');
    console.log('  SMTP_FROM="Talent IQ <your_email@gmail.com>"');
    console.log('');
    console.log('See EMAIL_SETUP_GUIDE.md for detailed instructions.');
    console.log('');
    console.log('💡 Current workaround: Password reset URLs are logged to console.');
    return;
  }

  try {
    console.log('Sending test email...');
    
    const testEmail = process.env.SMTP_USER; // Send to yourself
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Talent IQ',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">✅ Email Configuration Working!</h1>
          <p>If you're reading this, your SMTP configuration is set up correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>User: ${process.env.SMTP_USER}</li>
          </ul>
          <p>You can now send password reset emails and meeting invitations.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is a test email from Talent IQ. You can safely delete it.
          </p>
        </div>
      `,
      text: 'Email Configuration Working! If you see this, your SMTP setup is correct.',
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('');
      console.log('Check your inbox:', testEmail);
      
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('');
        console.log('📧 Ethereal Email - View at: https://ethereal.email/messages');
      }
    } else if (result.skipped) {
      console.log('⚠️  Email skipped (SMTP not configured for production)');
    } else {
      console.log('❌ Email failed:', result.error);
      console.log('');
      console.log('Common issues:');
      console.log('  - Gmail: Use App Password, not regular password');
      console.log('  - Check username/password are correct');
      console.log('  - Ensure firewall allows port', process.env.SMTP_PORT);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Full error:', error);
  }
}

testEmail();
