require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { email: 'test@mydevmail.com', purpose: 'email-verification' }, 
  process.env.JWT_SECRET || 'YOUR_JWT_SECRET',
  { expiresIn: '24h' }
);

console.log('Encoded token for URL:');
console.log(encodeURIComponent(token));
