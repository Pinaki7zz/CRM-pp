// final-cleanup.js - Run this ONCE to clean up existing duplicates
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCleanup() {
    console.log('🧹 Final cleanup of duplicate attachments...');
    
    try {
        // Get all emails with their attachments
        const emailsWithAttachments = await prisma.email.findMany({
            include: {
                attachments: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        
        let totalDeleted = 0;
        
        for (const email of emailsWithAttachments) {
            if (email.attachments.length <= 1) continue;
            
            console.log(`\n📧 Email: "${email.subject}" has ${email.attachments.length} attachments`);
            
            // Group attachments by original filename (removing timestamp prefix)
            const attachmentGroups = {};
            
            email.attachments.forEach(att => {
                // Extract original filename by removing timestamp_random_ prefix pattern
                const originalName = att.filename.replace(/^\d+_[a-f0-9]+_/, '');
                
                if (!attachmentGroups[originalName]) {
                    attachmentGroups[originalName] = [];
                }
                attachmentGroups[originalName].push(att);
            });
            
            // For each group, keep the oldest, delete the rest
            for (const [originalName, attachments] of Object.entries(attachmentGroups)) {
                if (attachments.length > 1) {
                    console.log(`   📎 Found ${attachments.length} copies of "${originalName}"`);
                    
                    // Keep the first (oldest), delete the rest
                    const toDelete = attachments.slice(1);
                    console.log(`   🗑️ Deleting ${toDelete.length} duplicates...`);
                    
                    for (const duplicate of toDelete) {
                        try {
                            await prisma.attachment.delete({
                                where: { id: duplicate.id }
                            });
                            totalDeleted++;
                            console.log(`     ❌ Deleted: ${duplicate.filename} (ID: ${duplicate.id})`);
                        } catch (deleteError) {
                            console.error(`     ❌ Error deleting ${duplicate.filename}:`, deleteError);
                        }
                    }
                }
            }
        }
        
        console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate attachments`);
        
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup
finalCleanup();
