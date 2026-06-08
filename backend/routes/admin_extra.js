const express = require('express');
const fs = require('fs');
const path = require('path');
const { authorizeAdmin, authenticate } = require('../middleware/auth');
const { Application, User } = require('../models');
const { createMembershipCard } = require('../utils/card');
const { sendEmail } = require('../utils/email');
const { Op } = require('sequelize');

const router = express.Router();
router.use(authenticate, authorizeAdmin);

// approve application (sequential membership number, card generation, email)
router.post('/applications/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { duration } = req.body;
  const months = Number(duration) || 12;

  try {
    const application = await Application.findByPk(id, { include: User });
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    if (application.status === 'approved') {
      return res.status(400).json({ message: 'Application is already approved.' });
    }

    application.status = 'approved';
    application.approvedAt = new Date();
    application.duration = months;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);
    application.expiryDate = expiry;

    const year = new Date().getFullYear();
    const unique = `${Date.now()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    application.membershipNumber = `ESH-${year}-${unique}`;

    let filePath = null;
    try {
      const result = await createMembershipCard(application);
      filePath = result.filePath;
      application.cardPath = result.fileName;
    } catch (cardErr) {
      console.error('Failed to generate membership card:', cardErr);
    }

    await application.save();

    try {
      await sendEmail({
        to: application.User.email,
        subject: 'Membership Approved',
        text: `Your application has been approved. Your membership number is ${application.membershipNumber}.`,
        attachments: filePath ? [{ filename: 'membership-card.pdf', path: filePath }] : [],
      });
    } catch (mailErr) {
      console.error('Failed to send approval email:', mailErr);
    }

    res.json({ application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not approve application.', error: error.message });
  }
});

// decline application
router.post('/applications/:id/decline', async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.findByPk(id, { include: User });
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = 'declined';
    await application.save();

    try {
      await sendEmail({
        to: application.User.email,
        subject: 'Membership Declined',
        text: 'Your membership application has been declined. Please contact support for details.',
      });
    } catch (mailErr) {
      console.error('Failed to send decline email:', mailErr);
    }

    res.json({ application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not decline application.' });
  }
});

// resend card
router.post('/applications/:id/resend', async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.findByPk(id, { include: User });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.status !== 'approved' || !application.cardPath) {
      return res.status(400).json({ message: 'Application is not approved or card missing.' });
    }

    try {
      await sendEmail({
        to: application.User.email,
        subject: 'Your Membership Card',
        text: `Attached is your membership card. Membership number: ${application.membershipNumber}`,
        attachments: [{ filename: 'membership-card.pdf', path: path.join(__dirname, '..', 'uploads', application.cardPath) }],
      });
      res.json({ message: 'Card resent.' });
    } catch (mailErr) {
      console.error('Failed to resend card:', mailErr);
      res.status(500).json({ message: 'Failed to resend card.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not resend card.' });
  }
});

// delete application and linked user, including proof of payment file
router.delete('/applications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.findByPk(id, { include: User });
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const proofPath = application.proofFile
      ? path.join(__dirname, '..', 'uploads', application.proofFile)
      : null;
    const user = application.User;

    await application.destroy();

    if (proofPath) {
      try {
        await fs.promises.unlink(proofPath);
      } catch (unlinkErr) {
        if (unlinkErr.code !== 'ENOENT') {
          console.error('Failed to remove proof file:', unlinkErr);
        }
      }
    }

    if (user) {
      try {
        await user.destroy();
      } catch (userErr) {
        console.error('Failed to remove user record:', userErr);
      }
    }

    res.json({ message: 'Application, customer, and proof file deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete customer record.' });
  }
});

// search members
router.get('/members/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    if (!q) return res.json({ results: [] });
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      },
      limit: 50,
    });
    const userIds = users.map((u) => u.id);
    const apps = await Application.findAll({
      where: {
        [Op.or]: [
          { membershipNumber: { [Op.like]: `%${q}%` } },
          ...(userIds.length ? [{ userId: userIds }] : []),
        ],
      },
      include: User,
      limit: 100,
    });
    res.json({ results: apps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Search failed.' });
  }
});

module.exports = router;
