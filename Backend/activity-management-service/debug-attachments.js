// debug-attachments.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAttachments() {
    console.log('🔍 Debugging attachment duplicates...');
    
    try {
        // Get all attachments for a specific email to see what's happening
        const allAttachments = await prisma.attachment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                email: {
                    select: { subject: true, externalId: true }
                }
            }
        });
        
        console.log(`📊 Total attachments in database: ${allAttachments.length}`);
        
        // Group by filename to find duplicates
        const fileGroups = {};
        allAttachments.forEach(att => {
            const key = att.filename;
            if (!fileGroups[key]) {
                fileGroups[key] = [];
            }
            fileGroups[key].push(att);
        });
        
        // Show files that appear multiple times
        Object.keys(fileGroups).forEach(filename => {
            const attachments = fileGroups[filename];
            if (attachments.length > 1) {
                console.log(`\n📄 File "${filename}" appears ${attachments.length} times:`);
                attachments.forEach((att, index) => {
                    console.log(`   ${index + 1}. ID: ${att.id}`);
                    console.log(`      Email: "${att.email.subject}"`);
                    console.log(`      Size: ${att.size}`);
                    console.log(`      Content Type: ${att.contentType}`);
                    console.log(`      Created: ${att.createdAt}`);
                    console.log(`      Email ID: ${att.emailId}`);
                    console.log(`      External ID: ${att.email.externalId}`);
                });
            }
        });
        
        // Check for same email having multiple attachments
        const emailGroups = {};
        allAttachments.forEach(att => {
            const emailId = att.emailId;
            if (!emailGroups[emailId]) {
                emailGroups[emailId] = [];
            }
            emailGroups[emailId].push(att);
        });
        
        console.log('\n📧 Emails with multiple attachments:');
        Object.keys(emailGroups).forEach(emailId => {
            const attachments = emailGroups[emailId];
            if (attachments.length > 1) {
                console.log(`\n   Email: "${attachments[0].email.subject}"`);
                console.log(`   Attachments: ${attachments.length}`);
                attachments.forEach(att => {
                    console.log(`     - ${att.filename} (${att.size} bytes) - ${att.id}`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAttachments();
