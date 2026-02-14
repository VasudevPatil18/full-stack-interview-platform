import dotenv from 'dotenv';

dotenv.config();

console.log('\n' + '='.repeat(60));
console.log('📧 EMAIL CONFIGURATION VERIFICATION');
console.log('='.repeat(60) + '\n');

console.log('Checking your email settings...\n');

const checks = [
  { name: 'SMTP_HOST', value: process.env.SMTP_HOST, expected: 'smtp.gmail.com' },
  { name: 'SMTP_PORT', value: process.env.SMTP_PORT, expected: '587' },
  { name: 'SMTP_USER', value: process.env.SMTP_USER, expected: 'your Gmail address' },
  { name: 'SMTP_PASS', value: process.env.SMTP_PASS, expected: '16-char App Password' },
  { name: 'SMTP_FROM', value: process.env.SMTP_FROM, expected: 'sender email' },
];

let allGood = true;

checks.forEach(check => {
  const hasValue = check.value && check.value.trim() !== '';
  const status = hasValue ? '✅' : '❌';
  
  if (!hasValue) allGood = false;
  
  if (check.name === 'SMTP_PASS') {
    console.log(`${status} ${check.name}: ${hasValue ? '***' + check.value.slice(-4) : 'NOT SET'}`);
  } else {
    console.log(`${status} ${check.name}: ${check.value || 'NOT SET'}`);
  }
});

console.log('\n' + '='.repeat(60));

if (allGood) {
  console.log('✅ ALL SETTINGS CONFIGURED!');
  console.log('='.repeat(60) + '\n');
  console.log('Next steps:');
  console.log('1. Restart your backend server (Ctrl+C then npm start)');
  console.log('2. Run: node test-email.js');
  console.log('3. Check your inbox: ' + process.env.SMTP_USER);
} else {
  console.log('❌ SOME SETTINGS MISSING!');
  console.log('='.repeat(60) + '\n');
  console.log('Please check your backend/.env file.');
}

console.log('');
