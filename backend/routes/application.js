const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { Application } = require('../models');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename(req, file, cb) {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '-');
      cb(null, `${timestamp}-${safeName}`);
    },
  }),
  fileFilter(req, file, cb) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/apply', authenticate, upload.single('proof'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Proof of payment file is required.' });
  }

  try {
    const application = await Application.create({
      userId: req.user.id,
      proofFile: req.file.filename,
      status: 'awaiting_payment_verification',
    });

    // notify user that application was received
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Application Received',
        text: `Hi, we received your membership application. We'll verify payment and update you soon.`,
      });
    } catch (mailErr) {
      console.error('Failed to send application email:', mailErr);
    }

    res.json({ application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Application submission failed.' });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      order: [['approvedAt', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load applications.' });
  }
});

module.exports = router;
