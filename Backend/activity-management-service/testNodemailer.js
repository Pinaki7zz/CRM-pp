// debug-nodemailer.js
console.log('=== Testing Different Import Methods ===');

// Method 1: Standard require
try {
  const nodemailer = require('nodemailer');
  console.log('✅ Standard require worked');
  console.log('Version:', nodemailer.version);
  console.log('createTransporter type:', typeof nodemailer.createTransporter);
} catch (error) {
  console.log('❌ Standard require failed:', error.message);
}

// Method 2: Check if module exists
try {
  const fs = require('fs');
  const path = require('path');
  const nodemailerPath = path.join(__dirname, 'node_modules', 'nodemailer');
  const exists = fs.existsSync(nodemailerPath);
  console.log('Nodemailer folder exists:', exists);
  
  if (exists) {
    const packagePath = path.join(nodemailerPath, 'package.json');
    const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('Installed version from package:', packageInfo.version);
  }
} catch (error) {
  console.log('❌ File system check failed:', error.message);
}

// Method 3: Direct path require
try {
  const nodemailer = require('./node_modules/nodemailer');
  console.log('✅ Direct path require worked');
} catch (error) {
  console.log('❌ Direct path require failed:', error.message);
}
