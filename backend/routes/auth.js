const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { sendEmail, emailEnabled } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to ES’HLAHLENI SOCIAL CLUB',
        text: `Hi ${name}, your account has been created successfully.`,
      });
    } catch (sendError) {
      console.warn('Registration succeeded but email failed:', sendError.message || sendError);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role'],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load user.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    if (!emailEnabled) {
      console.log('Email disabled, preview reset URL:', resetUrl);
      return res.json({
        message: 'Password reset link generated (preview).',
        resetUrl,
      });
    }

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link below to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      });
      return res.json({ message: 'Password reset link sent to your email.' });
    } catch (mailErr) {
      console.warn('Password reset email failed:', mailErr.message || mailErr);
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        console.log('Falling back to preview reset URL:', resetUrl);
        return res.json({
          message: 'Password reset link generated (preview).',
          resetUrl,
        });
      }
      return res.status(500).json({ message: 'Unable to send password reset email. Please try again later.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process password reset request.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          [require('sequelize').Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});

module.exports = router;
