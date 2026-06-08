const nodemailer = require('nodemailer');

const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PORT;
const isPlaceholderHost = process.env.EMAIL_HOST === 'smtp.example.com';
const isPlaceholderUser = /example\.com|your-email/.test(process.env.EMAIL_USER || '');
const isPlaceholderPass = /your-email-password/.test(process.env.EMAIL_PASS || '');
const emailEnabled = Boolean(hasEmailConfig && !isPlaceholderHost && !isPlaceholderUser && !isPlaceholderPass);

const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

async function sendEmail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
    attachments,
  };

  if (!emailEnabled) {
    console.log('Email disabled — not sending email. Mail preview:');
    console.log(mailOptions);
    return { preview: true, mailOptions };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info && info.messageId ? info.messageId : 'OK');
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message || error);
    throw error;
  }
}

module.exports = { sendEmail, emailEnabled };
