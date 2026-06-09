const express = require('express');
const fs = require('fs');
const path = require('path');
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
    res.status(500).json({
      message: 'Could not load applications.'
    });
  }
});

// DOWNLOAD CARD
router.get('/applications/:id/card', async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: User
    });

    if (!application) {
      return res.status(404).json({
        message: 'Application not found.'
      });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({
        message: 'Membership not approved yet.'
      });
    }

    const result = await createMembershipCard(application);

    return res.download(result.filePath);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Could not generate membership card.'
    });
  }
});

// UPDATE STATUS
router.put('/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, duration } = req.body;

  if (
    ![
      'pending',
      'awaiting_payment_verification',
      'approved',
      'declined'
    ].includes(status)
  ) {
    return res.status(400).json({
      message: 'Invalid status.'
    });
  }

  try {
    const application = await Application.findByPk(id, {
      include: User
    });

    if (!application) {
      return res.status(404).json({
        message: 'Application not found.'
      });
    }

    application.status = status;

    if (status === 'approved') {
      application.approvedAt = new Date();

      const months = Number(duration || 12);

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + months);

      application.expiryDate = expiry;

      if (!application.membershipNumber) {
        const year = new Date().getFullYear();
        const unique = Date.now();

        application.membershipNumber =
          `ESH-${year}-${unique}`;
      }

      try {
        const result = await createMembershipCard(application);

        application.cardPath = result.fileName;

        await sendEmail({
          to: application.User.email,
          subject: 'Membership Approved',
          text: `
Your membership application has been approved.

Membership Number:
${application.membershipNumber}

Duration:
${months} month(s)

Expiry Date:
${application.expiryDate.toDateString()}
          `,
          attachments: [
            {
              filename: result.fileName,
              path: result.filePath
            }
          ]
        });

      } catch (cardError) {
        console.error(
          'Membership card generation failed:',
          cardError
        );
      }
    }

    if (status === 'declined') {
      try {
        await sendEmail({
          to: application.User.email,
          subject: 'Membership Application Declined',
          text:
            'Unfortunately your membership application was not approved.'
        });
      } catch (mailError) {
        console.error(mailError);
      }
    }

    await application.save();

    return res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Could not update status.'
    });
  }
});

// DELETE APPLICATION
router.delete('/applications/:id', async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: 'Application not found.'
      });
    }

    if (application.cardPath) {
      const filePath = path.join(
        __dirname,
        '..',
        'uploads',
        application.cardPath
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await application.destroy();

    return res.json({
      success: true,
      message: 'Application deleted.'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Could not delete application.'
    });
  }
});

module.exports = router;
