const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { Application } = require('../models');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Create uploads directory automatically
const uploadDir = path.join(__dirname, '..', 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads folder created');
  }
} catch (err) {
  console.error('Failed to create uploads folder:', err);
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir);
    },
    filename(req, file, cb) {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '-');
      cb(null, `${timestamp}-${safeName}`);
    },
  }),
  fileFilter(req, file, cb) {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/apply', authenticate, upload.single('proof'), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof of payment file is required.'
      });
    }

    console.log('Authenticated User:', req.user);

    const application = await Application.create({
      userId: req.user.id,
      proofFile: req.file.filename,
      status: 'awaiting_payment_verification'
    });

    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Application Received',
        text: "Hi, we received your membership application. We'll verify payment and update you soon."
      });
    } catch (mailErr) {
      console.error('Email sending failed:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application
    });

  } catch (error) {

    console.error('================================');
    console.error('APPLICATION SUBMISSION ERROR');
    console.error(error);
    console.error('MESSAGE:', error.message);

    if (error.parent) {
      console.error('DATABASE ERROR:', error.parent.sqlMessage);
    }

    console.error('================================');

    return res.status(500).json({
      success: false,
      message: error.message,
      databaseError: error.parent?.sqlMessage || null
    });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  try {

    const applications = await Application.findAll({
      where: {
        userId: req.user.id
      },
      order: [
        ['approvedAt', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return res.json({
      success: true,
      applications
    });

  } catch (error) {

    console.error('GET APPLICATIONS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
