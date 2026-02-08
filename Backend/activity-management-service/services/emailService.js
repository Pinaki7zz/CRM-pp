// services/emailService.js
const { PrismaClient } = require('@prisma/client');
const imapService = require('./imapService');
const fileService = require('./fileService');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const emailService = {
    _syncInProgress: false,
    
    // ------------------------------------------------------------------
    // 1. SYNC LOGIC (IMAP -> DB)
    // ------------------------------------------------------------------
    syncEmails: async () => {
        console.log('🔄 Starting BULLETPROOF email sync with filtering...');
        
        if (emailService._syncInProgress) {
            console.log('⚠️ Email sync already in progress, skipping...');
            return { count: 0, message: 'Sync already in progress' };
        }
        
        emailService._syncInProgress = true;
        
        try {
            // STEP 1: Fetch emails from IMAP
            const rawEmails = await imapService.fetchEmails();
            console.log(`📨 Fetched ${rawEmails.length} emails from Gmail`);
            
            if (rawEmails.length === 0) {
                return { count: 0, message: 'No emails found' };
            }

            // STEP 2: Get ALL existing emails to prevent duplicates
            const allExistingEmails = await prisma.email.findMany({
                select: { externalId: true }
            });
            const existingEmailIds = new Set(allExistingEmails.map(e => e.externalId));
            
            // STEP 3: Filter to only genuinely new emails
            const genuinelyNewEmails = rawEmails.filter(email => !existingEmailIds.has(email.externalId));
            
            if (genuinelyNewEmails.length === 0) {
                console.log('ℹ️ No genuinely new emails to sync');
                return { count: 0, message: 'No new emails to sync' };
            }

            console.log(`📤 Processing ${genuinelyNewEmails.length} genuinely new emails`);

            // STEP 4: Process each email
            let emailsCreated = 0;
            let attachmentsCreated = 0;

            for (const emailData of genuinelyNewEmails) {
                try {
                    const { attachments, ...mainEmailData } = emailData;
                    
                    // Create the email
                    const createdEmail = await prisma.email.create({
                        data: mainEmailData
                    });
                    emailsCreated++;
                    
                    // Process attachments
                    if (attachments && attachments.length > 0) {
                        for (const att of attachments) {
                            await prisma.attachment.create({
                                data: {
                                    filename: att.filename.toLowerCase(),
                                    contentType: att.contentType || 'application/octet-stream',
                                    size: att.size || 0,
                                    path: att.path,
                                    storageProvider: att.storageProvider || 'local',
                                    emailId: createdEmail.id
                                }
                            });
                            attachmentsCreated++;
                        }
                    }
                } catch (emailError) {
                    console.error(`❌ Email error: "${emailData.subject}"`, emailError.message);
                }
            }

            return {
                count: emailsCreated,
                message: `Successfully created ${emailsCreated} emails with ${attachmentsCreated} attachments`
            };

        } catch (error) {
            console.error('❌ Sync error:', error);
            throw error;
        } finally {
            emailService._syncInProgress = false;
        }
    },

    // ------------------------------------------------------------------
    // 2. QUERYING & GETTERS (✅ FIXED PAGINATION TYPES)
    // ------------------------------------------------------------------
    getAllEmails: async (filters = {}) => {
        const { status, priority, search, page = 1, limit = 10 } = filters;
        
        // ✅ CRITICAL FIX: Ensure page and limit are Integers
        // If these are strings "10", Prisma will crash.
        const p = parseInt(page, 10) || 1;
        const l = parseInt(limit, 10) || 10;

        const where = {};
        
        if (status) where.status = status;
        
        // Only filter by priority if it's not empty
        if (priority && priority !== 'All') where.priority = priority; 
        
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { sender: { contains: search, mode: 'insensitive' } },
                // Optional: Search by recipient too
                { recipient: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        const [emails, total] = await prisma.$transaction([
            prisma.email.findMany({
                where,
                orderBy: { receivedAt: 'desc' },
                take: l, 
                skip: (p - 1) * l,
                include: {
                    attachments: true,
                    emailContacts: true
                }
            }),
            prisma.email.count({ where })
        ]);
        
        return { emails, total };
    },

    getEmailById: async (id) => {
        return prisma.email.findUnique({
            where: { id },
            include: {
                attachments: true,
                emailContacts: true
            }
        });
    },

    getEmailStats: async () => {
        const [total, unread, read] = await prisma.$transaction([
            prisma.email.count(),
            prisma.email.count({ where: { status: 'UNREAD' } }),
            prisma.email.count({ where: { status: 'READ' } })
        ]);
        
        return { total, unread, read };
    },

    // ------------------------------------------------------------------
    // 3. STATUS UPDATES
    // ------------------------------------------------------------------
    markAsRead: async (id) => {
        return prisma.email.update({
            where: { id },
            data: { status: 'READ', readAt: new Date() }
        });
    },

    updateEmailStatus: async (id, status) => {
        return prisma.email.update({
            where: { id },
            data: { status }
        });
    },

    bulkUpdateEmailStatus: async (ids, status) => {
        return prisma.email.updateMany({
            where: { id: { in: ids } },
            data: { status }
        });
    },

    // ------------------------------------------------------------------
    // 4. ACTIONS
    // ------------------------------------------------------------------
    sendAutoReply: async (id, message) => {
        const originalEmail = await prisma.email.findUnique({ where: { id } });
        if (!originalEmail) throw new Error('Original email not found');
        
        const mailOptions = {
            from: `"${process.env.EMAIL_NAME || 'CRM'}" <${process.env.EMAIL_USER}>`,
            to: originalEmail.sender,
            subject: `Re: ${originalEmail.subject}`,
            text: message,
            html: `<p>${message}</p>`,
            inReplyTo: originalEmail.messageId,
            references: originalEmail.messageId
        };
        
        return transporter.sendMail(mailOptions);
    },

    deleteEmail: async (id) => {
        const emailToDelete = await prisma.email.findUnique({
            where: { id },
            include: { attachments: true }
        });
        
        if (emailToDelete?.attachments?.length) {
            const deletionPromises = emailToDelete.attachments.map(att =>
                fileService.deleteAttachment(att.path)
            );
            await Promise.all(deletionPromises);
        }
        
        return prisma.email.delete({ where: { id } });
    }
};

module.exports = emailService;