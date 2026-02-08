// verify-install.js
console.log('=== Verifying Complete Installation ===');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded');
  console.log('Version:', nodemailer.version);
  console.log('createTransporter:', typeof nodemailer.createTransporter);
  
  // Test creating a transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'test@example.com',
      pass: 'test'
    }
  });
  console.log('✅ Transporter created successfully');
  
} catch (error) {
  console.log('❌ Nodemailer Error:', error.message);
}

try {
  const Imap = require('node-imap');
  console.log('✅ IMAP loaded');
} catch (error) {
  console.log('❌ IMAP Error:', error.message);
}

try {
  const { simpleParser } = require('mailparser');
  console.log('✅ Mailparser loaded');
} catch (error) {
  console.log('❌ Mailparser Error:', error.message);
}
