require('dotenv').config();
const { sendEmail } = require('./utils/email');

async function runTest() {
  console.log('Using SMTP settings:');
  console.log('EMAIL_HOST=', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT=', process.env.EMAIL_PORT);
  console.log('EMAIL_USER=', process.env.EMAIL_USER);

  try {
    await sendEmail({
      to: process.env.EMAIL_USER || process.env.TEST_EMAIL,
      subject: 'ESH Test Email',
      text: 'This is a test email from the ES\'HLAHLENI membership app. If you receive this, SMTP is configured correctly.'
    });
    console.log('sendEmail called — check console logs above and your inbox (including spam).');
  } catch (err) {
    console.error('send failed:', err);
  }
}

runTest();
