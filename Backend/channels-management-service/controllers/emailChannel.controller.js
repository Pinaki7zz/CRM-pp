const emailChannelService = require('../services/emailChannel.service');
const { validationResult } = require('express-validator');

const EmailChannelController = {
  // GET /api/email-channels
  async getAllEmailChannels(req, res) {
    try {
      const emailChannels = await emailChannelService.getAllEmailChannels();
      res.json({
        success: true,
        data: emailChannels
      });
    } catch (error) {
      console.error('Get all email channels error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve email channels',
        error: error.message
      });
    }
  },

  // GET /api/email-channels/:id
  async getEmailChannelById(req, res) {
    try {
      const { id } = req.params;
      const emailChannel = await emailChannelService.getEmailChannelById(id);

      if (!emailChannel) {
        return res.status(404).json({
          success: false,
          message: 'Email channel not found'
        });
      }

      res.json({
        success: true,
        data: emailChannel
      });
    } catch (error) {
      console.error('Get email channel by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve email channel',
        error: error.message
      });
    }
  },

  // POST /api/email-channels
  async createEmailChannel(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const emailChannel = await emailChannelService.createEmailChannel(req.body);
      res.status(201).json({
        success: true,
        message: 'Email channel created successfully',
        data: emailChannel
      });
    } catch (error) {
      console.error('Create email channel error:', error);

      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          return res.status(409).json({
            success: false,
            message: 'Email address already exists'
          });
        }
        if (field === 'channelId') {
          return res.status(409).json({
            success: false,
            message: 'Channel ID already exists'
          });
        }
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create email channel'
      });
    }
  },

  // PUT /api/email-channels/:id
  async updateEmailChannel(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const emailChannel = await emailChannelService.updateEmailChannel(id, req.body);

      res.json({
        success: true,
        message: 'Email channel updated successfully',
        data: emailChannel
      });
    } catch (error) {
      console.error('Update email channel error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Email channel not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update email channel',
        error: error.message
      });
    }
  },

  // DELETE /api/email-channels/:id
  async deleteEmailChannel(req, res) {
    try {
      const { id } = req.params;
      await emailChannelService.deleteEmailChannel(id);

      res.json({
        success: true,
        message: 'Email channel deleted successfully'
      });
    } catch (error) {
      console.error('Delete email channel error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Email channel not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete email channel',
        error: error.message
      });
    }
  },

  // POST /api/email-channels/:id/activate
  async activateEmailChannel(req, res) {
    try {
      const { id } = req.params;
      const emailChannel = await emailChannelService.activateEmailChannel(id);

      res.json({
        success: true,
        message: 'Email channel activated successfully',
        data: emailChannel
      });
    } catch (error) {
      console.error('Activate email channel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate email channel',
        error: error.message
      });
    }
  },

  // POST /api/email-channels/:id/deactivate
  async deactivateEmailChannel(req, res) {
    try {
      const { id } = req.params;
      const emailChannel = await emailChannelService.deactivateEmailChannel(id);

      res.json({
        success: true,
        message: 'Email channel deactivated successfully',
        data: emailChannel
      });
    } catch (error) {
      console.error('Deactivate email channel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate email channel',
        error: error.message
      });
    }
  },

  // POST /api/email-channels/verify-email
  async verifyEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const result = await emailChannelService.verifyEmailExists(email);

      res.json({
        success: true,
        message: result.message,
        sent: result.sent,
        verified: result.verified
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send verification email'
      });
    }
  },

  // GET /api/email-channels/confirm/:token (✅ FIXED)
  async confirmEmail(req, res) {
    try {
      console.log('🔍 Received encoded token:', req.params.token);

      // Decode the URL-encoded token
      const token = decodeURIComponent(req.params.token);
      console.log('🔍 Decoded token:', token);

      const result = await emailChannelService.confirmEmailVerification(token);

      const redirectUrl = `http://localhost:4010/email-verification-success?email=${encodeURIComponent(result.email)}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Confirm email error:', error.message);
      const errorUrl = `http://localhost:4010/email-verification-error?error=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  },

  // GET /api/email-channels/verification-status/:email
  async getVerificationStatus(req, res) {
    try {
      const { email } = req.params;
      const status = await emailChannelService.getEmailVerificationStatus(decodeURIComponent(email));

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get verification status',
        error: error.message
      });
    }
  },

  // Add this new method to your EmailChannelController object
  // POST /api/email-channels/unverify-email (FOR TESTING ONLY)
  async unverifyEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const result = await emailChannelService.unverifyEmail(email);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Unverify email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unverify email'
      });
    }
  }

};

module.exports = EmailChannelController;
