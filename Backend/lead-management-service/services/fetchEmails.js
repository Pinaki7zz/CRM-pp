// services/fetchEmails.js
require('dotenv').config({ path: '../.env' });
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

// DB service import (if using Prisma or custom function to save leads)
// const { saveLeadToDB } = require('./leadService'); // Uncomment after creating

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function fetchEmails() {
  try {
    await client.connect();

    const lock = await client.getMailboxLock('INBOX');

    console.log("Loaded credentials:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');


    try {
      // Fetch unread (unseen) emails
      for await (const message of client.fetch({ seen: false }, { envelope: true, source: true })) {
        const parsed = await simpleParser(message.source);

        // Extract basic fields
        const from = parsed.from?.value[0]?.address || 'Unknown';
        const name = parsed.from?.value[0]?.name || 'No Name';
        const subject = parsed.subject || 'No Subject';
        const body = parsed.text || '';

        // Extract phone number using regex
        const phoneMatch = body.match(/(?:\+91|0)?[6-9]\d{9}/);
        const phone = phoneMatch ? phoneMatch[0] : 'Not provided';

        // Lead object
        const lead = {
          name,
          email: from,
          phone,
          subject,
          message: body.trim(),
        };

        console.log('🎯 New Lead Captured:');
        console.log(lead);

        // TODO: Save to database
        // await saveLeadToDB(lead);
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
  }
}
console.log('Loaded ENV:', process.env.EMAIL_USER, process.env.EMAIL_PASS);


// Export so it can be used in a cron job or server script
module.exports = fetchEmails;

// For standalone testing, uncomment below:
if (require.main === module) {
  fetchEmails();
}
