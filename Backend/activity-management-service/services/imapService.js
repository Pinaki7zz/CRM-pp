// services/imapService.js - COMPLETELY FIXED VERSION WITH ATTACHMENT FILTERING
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const fileService = require('./fileService');
const AttachmentFilter = require('./attachmentFilter');

const imapService = {
    fetchEmails: async (maxEmails = 25) => {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connecting to Gmail...');
            const imap = new Imap({
                user: process.env.EMAIL_USER,
                password: process.env.EMAIL_PASSWORD,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            });

            imap.once('error', (err) => reject(err));

            imap.once('ready', () => {
                console.log('✅ Gmail connection ready.');
                imap.openBox('INBOX', true, (err, box) => {
                    if (err) return reject(err);

                    imap.search(['ALL'], (searchErr, results) => {
                        if (searchErr || !results || results.length === 0) {
                            console.warn('No emails found.');
                            return resolve([]);
                        }

                        const emailsToFetch = results.slice(-maxEmails);
                        console.log(`Found ${results.length} total emails. Fetching the latest ${emailsToFetch.length}.`);

                        const f = imap.seq.fetch(emailsToFetch, {
                            bodies: '',
                            struct: true
                        });

                        const emailPromises = [];
                        const processedMessageIds = new Set();

                        f.on('message', (msg, seqno) => {
                            let fullRawMessage = '';
                            let attributes;

                            msg.on('body', (stream, info) => {
                                stream.on('data', (chunk) => {
                                    fullRawMessage += chunk.toString('utf8');
                                });
                            });

                            msg.once('attributes', (attrs) => {
                                attributes = attrs;
                            });

                            msg.once('end', () => {
                                const emailPromise = new Promise(async (res) => {
                                    try {
                                        console.log(`\n--- PARSING EMAIL ${seqno} ---`);
                                        
                                        const parsedEmail = await simpleParser(fullRawMessage);
                                        
                                        const messageId = parsedEmail.messageId || 
                                            (attributes?.uid ? `<${attributes.uid}@gmail>` : 
                                            `generated_${seqno}_${Date.now()}_${Math.random()}`);
                                        
                                        // Skip if already processed in this session
                                        if (processedMessageIds.has(messageId)) {
                                            console.log(`⚠️ Skipping duplicate in IMAP: ${messageId}`);
                                            res(null);
                                            return;
                                        }
                                        processedMessageIds.add(messageId);
                                        
                                        const senderAddress = parsedEmail.from?.value?.[0]?.address || 'unknown@unknown.com';
                                        const senderName = parsedEmail.from?.value?.[0]?.name || senderAddress.split('@') || 'Unknown Sender';
                                        const recipient = parsedEmail.to?.value?.[0]?.address || process.env.EMAIL_USER || 'unknown@unknown.com';
                                        const subject = parsedEmail.subject || 'No Subject';
                                        const receivedAt = parsedEmail.date || new Date();

                                        // ✅ PROCESS ATTACHMENTS WITH FILTERING
                                        const attachments = [];
                                        if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
                                            console.log(`📎 Found ${parsedEmail.attachments.length} raw attachments`);
                                            
                                            const seenAttachments = new Map();
                                            let filteredCount = 0;
                                            
                                            for (const attachment of parsedEmail.attachments) {
                                                try {
                                                    const normalizedFilename = (attachment.filename || `attachment_${Date.now()}`)
                                                        .toLowerCase().trim();
                                                    const attachmentSize = attachment.size || 0;
                                                    const contentType = attachment.contentType || 'unknown';
                                                    const attachmentKey = `${normalizedFilename}_${attachmentSize}_${contentType}`;
                                                    
                                                    // Skip duplicates within same email
                                                    if (seenAttachments.has(attachmentKey)) {
                                                        console.log(`⚠️ Duplicate in email: ${normalizedFilename}`);
                                                        continue;
                                                    }
                                                    seenAttachments.set(attachmentKey, attachment);
                                                    
                                                    // ✅ CHECK IF ATTACHMENT IS IMPORTANT
                                                    const isImportant = AttachmentFilter.isImportant(
                                                        { filename: normalizedFilename, size: attachmentSize, contentType },
                                                        parsedEmail.html || ''
                                                    );
                                                    
                                                    if (!isImportant) {
                                                        const reason = AttachmentFilter.getFilterReason(
                                                            { filename: normalizedFilename, size: attachmentSize, contentType },
                                                            parsedEmail.html || ''
                                                        );
                                                        console.log(`🚫 FILTERED OUT: ${normalizedFilename} (${attachmentSize} bytes) - ${reason}`);
                                                        filteredCount++;
                                                        continue;
                                                    }
                                                    
                                                    // Save important attachment
                                                    const savedAttachment = await fileService.saveAttachment(attachment);
                                                    
                                                    attachments.push({
                                                        filename: savedAttachment.filename,
                                                        contentType: contentType,
                                                        size: attachmentSize,
                                                        path: savedAttachment.storagePath,
                                                        storageProvider: savedAttachment.storageProvider,
                                                        downloadUrl: savedAttachment.downloadUrl,
                                                        sharePointId: savedAttachment.sharePointId
                                                    });
                                                    
                                                    console.log(`✅ SAVED: ${savedAttachment.filename} (${attachmentSize} bytes)`);
                                                } catch (attError) {
                                                    console.error(`❌ Error processing ${attachment.filename}:`, attError);
                                                }
                                            }
                                            
                                            console.log(`📊 Attachment Summary: ${attachments.length} saved, ${filteredCount} filtered out`);
                                        }

                                        const emailData = {
                                            externalId: messageId,
                                            messageId: messageId,
                                            subject: subject,
                                            sender: senderAddress,
                                            senderName: senderName,
                                            recipient: recipient,
                                            content: parsedEmail.text || '',
                                            htmlContent: parsedEmail.html || null,
                                            receivedAt: receivedAt,
                                            priority: 'MEDIUM',
                                            status: 'UNREAD',
                                            attachments: attachments
                                        };

                                        console.log(`📧 Parsed: "${subject}" from "${senderName}"`);
                                        console.log(`📎 Final attachments: ${attachments.length}`);
                                        console.log('--- END PARSING ---\n');
                                        res(emailData);

                                    } catch (processingError) {
                                        console.error(`❌ Error processing email ${seqno}:`, processingError);
                                        res(null);
                                    }
                                });

                                emailPromises.push(emailPromise);
                            });
                        });

                        f.once('error', (fetchErr) => {
                            console.error('❌ IMAP fetch error:', fetchErr);
                            imap.end();
                            reject(fetchErr);
                        });

                        f.once('end', () => {
                            Promise.all(emailPromises)
                            .then(emails => {
                                const validEmails = emails.filter(e => e !== null);
                                console.log(`✅ Successfully processed ${validEmails.length} out of ${emails.length} emails from IMAP`);
                                imap.end();
                                resolve(validEmails);
                            });
                        });
                    });
                });
            });

            imap.connect();
        });
    }
};

module.exports = imapService;
