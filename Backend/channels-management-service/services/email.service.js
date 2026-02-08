const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Configure Gmail SMTP transporter with the correct function name
const transporter = nodemailer.createTransport({
  service: 'gmail', // Uses Gmail's SMTP settings automatically
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Alternative: Manual SMTP configuration
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const EmailService = {
  generateVerificationToken(email) {
    const payload = {
      email,
      purpose: 'email-verification',
      timestamp: Date.now()
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🎯 Generated token for:', email);
    return token;
  },

  // ✅ URL-encode the token to make it URL-safe
  async sendVerificationEmail(email, verificationToken) {
    const encodedToken = encodeURIComponent(verificationToken);
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:4008'}/api/email-channels/confirm/${encodedToken}`;

    console.log('🔗 Verification URL:', verificationUrl);

    const mailOptions = {
      from: `"Email Channel CRM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email Address - Email Channel CRM',
      html: `
      <!-- Your existing email template -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="verify-button">
          ✅ Verify My Email Address
        </a>
      </div>
      <p>Or copy this link: ${verificationUrl}</p>
    `
    };

    return await transporter.sendMail(mailOptions);
  },


  // Test email connection
  async testEmailConnection() {
    try {
      await transporter.verify();
      console.log('✅ Email server connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      throw new Error('Email server connection failed');
    }
  },

  // ✅ ENHANCED: Better token verification with debug logging
  verifyToken(token) {
    try {
      console.log('🔍 Verifying token...');
      console.log('🔍 Token length:', token.length);
      console.log('🔍 JWT_SECRET is set:', !!process.env.JWT_SECRET);

      // Decode without verification first to check structure
      const decoded = jwt.decode(token, { complete: true });
      console.log('🔍 Token header:', decoded?.header);
      console.log('🔍 Token payload:', decoded?.payload);

      if (decoded?.payload?.exp) {
        const expiryTime = new Date(decoded.payload.exp * 1000);
        const currentTime = new Date();
        console.log('🔍 Token expires at:', expiryTime);
        console.log('🔍 Current time:', currentTime);
        console.log('🔍 Token is expired:', expiryTime < currentTime);
      }

      // Now verify with secret
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verification successful');
      return verified;
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);

      if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid verification token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }
};

// Test connection on startup
EmailService.testEmailConnection().catch(error => {
  console.error('⚠️  Email service not configured properly:', error.message);
});

module.exports = EmailService;
