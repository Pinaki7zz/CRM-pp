const { PrismaClient } = require('@prisma/client');
const EmailService = require('./email.service');
const prisma = new PrismaClient();

// Generate descriptive channel ID based on channel name and type
const generateDescriptiveChannelId = async (channelType, channelName) => {
  // Get the business type (B2B/B2C)
  const businessType = channelType === 'B2B' ? 'B2B' : 'B2C';
  
  // Clean channel name for ID (remove spaces, special chars, keep alphanumeric)
  const cleanName = channelName ? 
    channelName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15) : 
    'Email';
  
  // Get next counter for this business type
  const counter = await getNextCounter(businessType);
  
  // Format: B2B-SalesDenmark-001 or B2C-SupportGlobal-002
  return `${businessType}-${cleanName}-${counter.toString().padStart(3, '0')}`;
};

// Get next available counter for the business type
const getNextCounter = async (businessType) => {
  try {
    // Find all existing channels that start with this business type
    const existingChannels = await prisma.emailChannel.findMany({
      where: {
        channelId: {
          startsWith: businessType
        }
      },
      select: {
        channelId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    let maxCounter = 0;
    
    // Extract counter from each channel ID and find the maximum
    existingChannels.forEach(channel => {
      const parts = channel.channelId.split('-');
      if (parts.length >= 3) {
        const counterStr = parts[parts.length - 1]; // Last part is the counter
        const counter = parseInt(counterStr, 10);
        if (!isNaN(counter) && counter > maxCounter) {
          maxCounter = counter;
        }
      }
    });
    
    return maxCounter + 1;
  } catch (error) {
    console.error('Error getting next counter:', error);
    return 1; // Fallback to 1 if error occurs
  }
};

const EmailChannelService = {
  async getAllEmailChannels() {
    return await prisma.emailChannel.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async getEmailChannelById(id) {
    // Try to find by internal id first, then by channelId
    let emailChannel = await prisma.emailChannel.findUnique({
      where: { id }
    });
    
    if (!emailChannel) {
      emailChannel = await prisma.emailChannel.findUnique({
        where: { channelId: id }
      });
    }
    
    return emailChannel;
  },

  async createEmailChannel(data) {
    const {
      email,
      channelName,
      senderDisplayName,
      template,
      channelDirection,
      subjectPattern,
      channelType
    } = data;

    // Check if email is verified
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        isVerified: true
      }
    });

    if (!verification) {
      throw new Error('Email must be verified before creating a channel');
    }

    // Validate required fields for ID generation
    if (!channelName || channelName.trim() === '') {
      throw new Error('Channel Name is required for generating Channel ID');
    }

    // Generate descriptive channelId based on channel name and type
    const channelId = await generateDescriptiveChannelId(channelType, channelName);

    return await prisma.emailChannel.create({
      data: {
        channelId,
        email,
        isEmailVerified: true,
        channelName,
        senderDisplayName,
        template,
        channelDirection: channelDirection || 'INBOUND_OUTBOUND',
        subjectPattern: subjectPattern || 'TICKET_SUBJECT',
        channelType: channelType || 'B2B',
        status: 'ACTIVE',
        isActive: true
      }
    });
  },

  async updateEmailChannel(id, data) {
    const {
      channelName,
      senderDisplayName,
      template,
      channelDirection,
      subjectPattern,
      channelType
    } = data;

    // Find the channel first
    const existingChannel = await this.getEmailChannelById(id);
    if (!existingChannel) {
      throw new Error('Email channel not found');
    }

    return await prisma.emailChannel.update({
      where: { id: existingChannel.id },
      data: {
        channelName,
        senderDisplayName,
        template,
        channelDirection,
        subjectPattern,
        channelType,
        updatedAt: new Date()
      }
    });
  },

  async deleteEmailChannel(id) {
    // Find the channel first
    const existingChannel = await this.getEmailChannelById(id);
    if (!existingChannel) {
      throw new Error('Email channel not found');
    }

    return await prisma.emailChannel.delete({
      where: { id: existingChannel.id }
    });
  },

  async activateEmailChannel(id) {
    // Find the channel first
    const existingChannel = await this.getEmailChannelById(id);
    if (!existingChannel) {
      throw new Error('Email channel not found');
    }

    return await prisma.emailChannel.update({
      where: { id: existingChannel.id },
      data: {
        isActive: true,
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });
  },

  async deactivateEmailChannel(id) {
    // Find the channel first
    const existingChannel = await this.getEmailChannelById(id);
    if (!existingChannel) {
      throw new Error('Email channel not found');
    }

    return await prisma.emailChannel.update({
      where: { id: existingChannel.id },
      data: {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: new Date()
      }
    });
  },

  // ✅ UPDATED: Email verification methods
  async verifyEmailExists(email) {
    try {
      // Check if email is already verified
      const existingVerification = await prisma.emailVerification.findFirst({
        where: {
          email,
          isVerified: true
        }
      });

      if (existingVerification) {
        return {
          sent: false,
          verified: true,
          message: 'Email is already verified!'
        };
      }

      // Generate verification token
      const verificationToken = EmailService.generateVerificationToken(email);
      
      // Calculate expiry (24 hours from now)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Delete any existing unverified tokens for this email
      await prisma.emailVerification.deleteMany({
        where: {
          email,
          isVerified: false
        }
      });

      // Create new verification record
      await prisma.emailVerification.create({
        data: {
          email,
          verificationToken,
          tokenExpiry,
          isVerified: false
        }
      });

      // Send verification email with correct link
      await EmailService.sendVerificationEmail(email, verificationToken);

      return {
        sent: true,
        verified: false,
        message: 'Verification email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error('Failed to send verification email');
    }
  },

  // ✅ UPDATED: Confirm email verification with redirect
  async confirmEmailVerification(token) {
    try {
      // Verify JWT token
      const decoded = EmailService.verifyToken(token);
      const email = decoded.email;

      // Find verification record
      const verification = await prisma.emailVerification.findFirst({
        where: {
          email,
          verificationToken: token,
          isVerified: false,
          tokenExpiry: { gte: new Date() }
        }
      });

      if (!verification) {
        throw new Error('Invalid or expired verification token');
      }

      // Mark as verified
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { 
          isVerified: true,
          updatedAt: new Date()
        }
      });

      return {
        verified: true,
        email,
        message: 'Email successfully verified!',
        // ✅ NEW: Return redirect URL for frontend confirmation page
        redirectUrl: `/email-verification-success?email=${encodeURIComponent(email)}`
      };
    } catch (error) {
      console.error('Email confirmation error:', error);
      throw error;
    }
  },

  async getEmailVerificationStatus(email) {
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        isVerified: true
      }
    });

    return {
      isVerified: !!verification,
      verifiedAt: verification?.updatedAt || null
    };
  },

  async cleanupExpiredTokens() {
    // Clean up expired verification tokens (run this periodically)
    const deletedCount = await prisma.emailVerification.deleteMany({
      where: {
        tokenExpiry: { lt: new Date() },
        isVerified: false
      }
    });

    console.log(`Cleaned up ${deletedCount.count} expired tokens`);
    return deletedCount.count;
  },
  // Add this new method to your EmailChannelService object
   async unverifyEmail(email) {
    try {
    // Delete all verification records for this email
    await prisma.emailVerification.deleteMany({
      where: {
        email: email
      }
    });

    // Optional: Also reset any email channel verification status
    await prisma.emailChannel.updateMany({
      where: {
        email: email
      },
      data: {
        isEmailVerified: false
      }
    });

    console.log(`✅ Email ${email} has been unverified for testing`);
    
    return {
      success: true,
      message: `Email ${email} has been successfully unverified`
    };
  } catch (error) {
    console.error('Unverify email error:', error);
    throw new Error('Failed to unverify email');
  }
}

};

// Cleanup expired tokens on startup
EmailChannelService.cleanupExpiredTokens().catch(console.error);

module.exports = EmailChannelService;
