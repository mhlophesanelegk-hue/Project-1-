const express = require('express');
const path = require('path');
const { Op } = require('sequelize');
const { authorizeAdmin, authenticate } = require('../middleware/auth');
const { Application, User } = require('../models');
const { createMembershipCard } = require('../utils/card');
const { sendEmail } = require('../utils/email');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

// GET ALL APPLICATIONS
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: User,
      order: [['createdAt', 'DESC']]
    });

    res.json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load applications.' });
  }
});


// UPDATE STATUS (WITH DURATION PER CUSTOMER)
router.put('/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, duration } = req.body; // ✅ added duration

  if (!['pending', 'awaiting_payment_verification', 'approved', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const application = await Application.findByPk(id, { include: User });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = status;

    if (status === 'approved') {

      // ----------------------------
      // APPROVAL DATE
      // ----------------------------
      application.approvedAt = new Date();

      // ----------------------------
      // PER CUSTOMER DURATION
      // ----------------------------
      const months = Number(duration || 12);

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + months);

      application.expiryDate = expiry;

      // ----------------------------
      // SAFE UNIQUE MEMBERSHIP NUMBER
      // (NO DUPLICATES EVER)
      // ----------------------------
      const year = new Date().getFullYear();
      const unique = Date.now() + Math.floor(Math.random() * 1000);

      application.membershipNumber = `ESH-${year}-${unique}`;

      // ----------------------------
      // CREATE CARD
      // ----------------------------
      let filePath = null;
      try {
        const result = await createMembershipCard(application);
        filePath = result.filePath;
        application.cardPath = result.fileName;
      } catch (cardErr) {
        console.error('Failed to generate membership card:', cardErr);
      }

      // ----------------------------
      // EMAIL APPROVAL
      // ----------------------------
      try {
        await sendEmail({
          to: application.User.email,
          subject: 'Membership Approved',
          text: `Your application has been approved.
Membership Number: ${application.membershipNumber}
Duration: ${months} month(s)
Expiry Date: ${application.expiryDate.toDateString()}`,
          attachments: filePath ? [
            {
              filename: 'membership-card.pdf',
              path: filePath
            }
          ] : [],
        });
      } catch (mailErr) {
        console.error('Failed to send approval email:', mailErr);
      }
    }

    if (status === 'declined') {
      try {
        await sendEmail({
          to: application.User.email,
          subject: 'Membership Declined',
          text: 'Your membership application has been declined. Please contact support for details.',
        });
      } catch (mailErr) {
        console.error('Failed to send decline email:', mailErr);
      }
    }

    await application.save();

    res.json({ application });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update status.' });
  }
});

module.exports = router;