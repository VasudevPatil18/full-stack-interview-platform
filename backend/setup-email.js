import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEmail() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 EMAIL CONFIGURATION SETUP');
  console.log('='.repeat(60) + '\n');

  console.log('Choose your email provider:\n');
  console.log('1. Gmail (Recommended for development)');
  console.log('2. SendGrid (Recommended for production)');
  console.log('3. Mailgun');
  console.log('4. Custom SMTP');
  console.log('5. Skip (emails will be logged to console only)\n');

  const choice = await question('Enter your choice (1-5): ');

  let smtpConfig = {};

  switch (choice.trim()) {
    case '1':
      console.log('\n📧 Gmail Setup\n');
      console.log('Before continuing:');
      console.log('1. Enable 2-Factor Authentication on your Gmail account');
      console.log('2. Go to: https://myaccount.google.com/apppasswords');
      console.log('3. Create an App Password for "Mail" → "Other (Talent IQ)"\n');
      
      const gmailEmail = await question('Enter your Gmail address: ');
      const gmailPassword = await question('Enter your App Password (16 characters): ');
      
      smtpConfig = {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: gmailEmail.trim(),
        SMTP_PASS: gmailPassword.trim().replace(/\s/g, ''),
        SMTP_FROM: `"Talent IQ" <${gmailEmail.trim()}>`
      };
      break;

    case '2':
      console.log('\n📧 SendGrid Setup\n');
      console.log('Before continuing:');
      console.log('1. Sign up at: https://signup.sendgrid.com/');
      console.log('2. Go to Settings → API Keys');
      console.log('3. Create an API Key with "Mail Send" permissions\n');
      
      const sendgridKey = await question('Enter your SendGrid API Key: ');
      const sendgridEmail = await question('Enter sender email: ');
      
      smtpConfig = {
        SMTP_HOST: 'smtp.sendgrid.net',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: 'apikey',
        SMTP_PASS: sendgridKey.trim(),
        SMTP_FROM: `"Talent IQ" <${sendgridEmail.trim()}>`
      };
      break;

    case '3':
      console.log('\n📧 Mailgun Setup\n');
      console.log('Before continuing:');
      console.log('1. Sign up at: https://www.mailgun.com/');
      console.log('2. Go to Sending → Domain Settings → SMTP credentials\n');
      
      const mailgunUser = await question('Enter Mailgun SMTP username: ');
      const mailgunPass = await question('Enter Mailgun SMTP password: ');
      const mailgunEmail = await question('Enter sender email: ');
      
      smtpConfig = {
        SMTP_HOST: 'smtp.mailgun.org',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: mailgunUser.trim(),
        SMTP_PASS: mailgunPass.trim(),
        SMTP_FROM: `"Talent IQ" <${mailgunEmail.trim()}>`
      };
      break;

    case '4':
      console.log('\n📧 Custom SMTP Setup\n');
      
      const customHost = await question('SMTP Host: ');
      const customPort = await question('SMTP Port (usually 587 or 465): ');
      const customSecure = await question('Use SSL/TLS? (yes/no): ');
      const customUser = await question('SMTP Username: ');
      const customPass = await question('SMTP Password: ');
      const customFrom = await question('From email address: ');
      
      smtpConfig = {
        SMTP_HOST: customHost.trim(),
        SMTP_PORT: customPort.trim(),
        SMTP_SECURE: customSecure.toLowerCase().trim() === 'yes' ? 'true' : 'false',
        SMTP_USER: customUser.trim(),
        SMTP_PASS: customPass.trim(),
        SMTP_FROM: `"Talent IQ" <${customFrom.trim()}>`
      };
      break;

    case '5':
      console.log('\n⚠️  Skipping email setup.');
      console.log('Emails will be logged to console only.');
      console.log('You can run this script again later to configure email.\n');
      rl.close();
      return;

    default:
      console.log('\n❌ Invalid choice. Exiting.\n');
      rl.close();
      return;
  }

  // Read existing .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing SMTP settings
  const lines = envContent.split('\n').filter(line => 
    !line.startsWith('SMTP_HOST') &&
    !line.startsWith('SMTP_PORT') &&
    !line.startsWith('SMTP_SECURE') &&
    !line.startsWith('SMTP_USER') &&
    !line.startsWith('SMTP_PASS') &&
    !line.startsWith('SMTP_FROM')
  );

  // Add new SMTP settings
  lines.push('');
  lines.push('# Email Configuration');
  Object.entries(smtpConfig).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });

  // Write back to .env
  fs.writeFileSync(envPath, lines.join('\n'));

  console.log('\n' + '='.repeat(60));
  console.log('✅ EMAIL CONFIGURATION SAVED!');
  console.log('='.repeat(60) + '\n');

  console.log('Configuration added to backend/.env:\n');
  Object.entries(smtpConfig).forEach(([key, value]) => {
    if (key === 'SMTP_PASS') {
      console.log(`  ${key}=***`);
    } else {
      console.log(`  ${key}=${value}`);
    }
  });

  console.log('\n📝 Next steps:\n');
  console.log('1. Restart your backend server:');
  console.log('   cd backend && npm start\n');
  console.log('2. Test email configuration:');
  console.log('   node test-email.js\n');
  console.log('3. Try password reset or meeting invite features\n');

  rl.close();
}

setupEmail().catch(error => {
  console.error('Error:', error);
  rl.close();
});
