const Imap = require('imap');
const emailConfig = require('../config/emailConfig');
const emailParserService = require('./emailParserService');
const leadService = require('./leadService'); // Your existing lead service
const emailUtils = require('../utils/emailUtils');

class EmailProcessorService {
  constructor() {
    this.imap = null;
    this.isProcessing = false;
    this.processedEmails = new Set(); // Track processed emails
  }

  // Initialize IMAP connection
  initializeConnection() {
    this.imap = new Imap(emailConfig.imapConfig);
    
    this.imap.once('ready', () => {
      console.log('✅ Connected to Gmail!');
    });
    
    this.imap.once('error', (err) => {
      console.error('❌ IMAP Connection error:', err);
    });
    
    this.imap.once('end', () => {
      console.log('🔌 IMAP Connection ended');
    });
  }

  // Main function to process emails
  async processEmails() {
    if (this.isProcessing) {
      console.log('⏳ Email processing already in progress...');
      return { status: 'already_processing' };
    }

    this.isProcessing = true;
    console.log('🚀 Starting email processing...');

    try {
      if (!this.imap) {
        this.initializeConnection();
      }

      const result = await this.connectAndProcessEmails();
      this.isProcessing = false;
      return result;

    } catch (error) {
      this.isProcessing = false;
      console.error('❌ Error processing emails:', error);
      throw error;
    }
  }

  // Connect to IMAP and process emails
  connectAndProcessEmails() {
    return new Promise((resolve, reject) => {
      this.imap.connect();

      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          console.log('📧 Inbox opened. Total messages:', box.messages.total);
          
          // Search for unread emails
          this.imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              reject(err);
              return;
            }

            if (results.length === 0) {
              console.log('📭 No unread emails found');
              this.imap.end();
              resolve({ 
                status: 'success', 
                processedCount: 0, 
                message: 'No unread emails to process' 
              });
              return;
            }

            console.log(`📬 Found ${results.length} unread emails`);
            this.fetchAndProcessEmails(results, resolve, reject);
          });
        });
      });

      this.imap.once('error', (err) => {
        reject(err);
      });
    });
  }

  // Fetch and process individual emails
  fetchAndProcessEmails(emailIds, resolve, reject) {
    const fetch = this.imap.fetch(emailIds, {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false // Don't mark as read yet
    });

    const processedResults = [];
    let processedCount = 0;

    fetch.on('message', (msg, seqno) => {
      console.log(`📨 Processing email #${seqno}`);
      
      let headers = {};
      let body = '';

      msg.on('body', (stream, info) => {
        let buffer = '';
        
        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
        });
        
        stream.once('end', () => {
          if (info.which === 'HEADER') {
            headers = Imap.parseHeader(buffer);
          } else if (info.which === 'TEXT') {
            body = buffer;
          }
        });
      });

      msg.once('end', async () => {
        try {
          // Parse email for lead data
          const leadData = emailParserService.parseEmailForLeads(headers, body);
          
          if (leadData.parseStatus === 'SUCCESS') {
            // Process the lead
            const leadResult = await this.processLeadFromEmail(leadData);
            processedResults.push({
              emailId: seqno,
              status: 'success',
              leadResult: leadResult
            });

            // Mark email as read after successful processing
            this.imap.addFlags(seqno, ['\\Seen'], (err) => {
              if (err) console.error('Error marking email as read:', err);
            });

          } else {
            console.error(`❌ Failed to parse email #${seqno}:`, leadData.error);
            processedResults.push({
              emailId: seqno,
              status: 'parse_failed',
              error: leadData.error
            });
          }

        } catch (error) {
          console.error(`❌ Error processing email #${seqno}:`, error);
          processedResults.push({
            emailId: seqno,
            status: 'error',
            error: error.message
          });
        }

        processedCount++;
        
        // Check if all emails are processed
        if (processedCount === emailIds.length) {
          this.imap.end();
          resolve({
            status: 'success',
            processedCount: processedCount,
            results: processedResults
          });
        }
      });
    });

    fetch.once('error', (err) => {
      console.error('❌ Fetch error:', err);
      reject(err);
    });
  }

  // Process lead from parsed email data
  async processLeadFromEmail(leadData) {
    try {
      // Check if lead already exists
      const existingLead = await leadService.checkLeadExists(leadData.email);
      
      if (existingLead) {
        console.log(`📝 Updating existing lead: ${leadData.email}`);
        
        // Update existing lead
        const updatedLead = await leadService.updateLead(existingLead.leadId, {
          company: leadData.company,
          jobTitle: leadData.jobTitle,
          phone: leadData.phone,
          notes: `Email received: ${leadData.subject}`,
          subject: leadData.subject
        });

        return {
          action: 'updated',
          leadId: updatedLead.leadId,
          email: leadData.email
        };

      } else {
        console.log(`✨ Creating new lead: ${leadData.email}`);
        
        // Create new lead
        const newLead = await leadService.createLead({
          email: leadData.email,
          name: leadData.name,
          company: leadData.company,
          jobTitle: leadData.jobTitle,
          phone: leadData.phone,
          originalEmail: leadData.originalEmail,
          subject: leadData.subject
        });

        return {
          action: 'created',
          leadId: newLead.leadId,
          email: leadData.email
        };
      }

    } catch (error) {
      console.error('❌ Error processing lead:', error);
      throw error;
    }
  }

  // Get processing status
  getProcessingStatus() {
    return {
      isProcessing: this.isProcessing,
      connectionStatus: this.imap ? 'connected' : 'disconnected'
    };
  }

  // Stop processing and close connection
  async stopProcessing() {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
    this.isProcessing = false;
    console.log('🛑 Email processing stopped');
  }

  // Test connection
  async testConnection() {
    return new Promise((resolve, reject) => {
      const testImap = new Imap(emailConfig.imapConfig);
      
      testImap.once('ready', () => {
        console.log('✅ Test connection successful');
        testImap.end();
        resolve({ status: 'success', message: 'Connection successful' });
      });
      
      testImap.once('error', (err) => {
        console.error('❌ Test connection failed:', err);
        reject(err);
      });
      
      testImap.connect();
    });
  }
}

module.exports = new EmailProcessorService();