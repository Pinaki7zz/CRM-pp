// services/fileService.js - COMPLETELY FIXED VERSION
const fs = require('fs').promises;
const path = require('path');

const STORAGE_CONFIG = {
    provider: process.env.STORAGE_PROVIDER || 'local',
    local: {
        attachmentsDir: path.join(__dirname, '..', 'attachments')
    },
    sharepoint: {
        siteUrl: process.env.SHAREPOINT_SITE_URL || '',
        libraryName: process.env.SHAREPOINT_LIBRARY || 'EmailAttachments',
        clientId: process.env.SHAREPOINT_CLIENT_ID || '',
        clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
        tenantId: process.env.SHAREPOINT_TENANT_ID || ''
    }
};

class AttachmentStorage {
    constructor() {
        this.provider = STORAGE_CONFIG.provider;
    }

    async saveAttachment(attachment) {
        if (this.provider === 'sharepoint') {
            return await this.saveToSharePoint(attachment);
        } else {
            return await this.saveToLocal(attachment);
        }
    }

    // ✅ FIXED: No more random prefixes, consistent lowercase naming
    async saveToLocal(attachment) {
        try {
            await this.ensureAttachmentsDir();
            
            // ✅ FIXED: Use original filename, normalize to lowercase consistently
            const sanitizedFilename = (attachment.filename || 'attachment')
                .toLowerCase()  // Always lowercase
                .replace(/[^a-zA-Z0-9.-]/g, '_');
            
            const filePath = path.join(STORAGE_CONFIG.local.attachmentsDir, sanitizedFilename);
            
            try {
                // Check if file already exists
                await fs.access(filePath);
                console.log(`💾 [LOCAL] File already exists: ${sanitizedFilename}`);
                
                return {
                    filename: sanitizedFilename,
                    storageProvider: 'local',
                    storagePath: sanitizedFilename,
                    downloadUrl: null,
                    sharePointId: null
                };
            } catch {
                // File doesn't exist, create it
                await fs.writeFile(filePath, attachment.content);
                console.log(`💾 [LOCAL] Saved new file: ${sanitizedFilename} (${attachment.size} bytes)`);
                
                return {
                    filename: sanitizedFilename,
                    storageProvider: 'local',
                    storagePath: sanitizedFilename,
                    downloadUrl: null,
                    sharePointId: null
                };
            }
            
        } catch (error) {
            console.error('Error saving attachment locally:', error);
            throw error;
        }
    }

    async saveToSharePoint(attachment) {
        // Fallback to local for now
        console.warn('⚠️ SharePoint not configured, falling back to local storage');
        return await this.saveToLocal(attachment);
    }

    async getAttachment(filename, storageProvider = null) {
        const provider = storageProvider || this.provider;
        
        if (provider === 'sharepoint') {
            return await this.getFromSharePoint(filename);
        } else {
            return await this.getFromLocal(filename);
        }
    }

    async getFromLocal(filename) {
        return path.join(STORAGE_CONFIG.local.attachmentsDir, filename);
    }

    async getFromSharePoint(filename) {
        throw new Error('SharePoint download not available');
    }

    async deleteAttachment(filename, storageProvider = null) {
        const provider = storageProvider || this.provider;
        
        if (provider === 'sharepoint') {
            await this.deleteFromSharePoint(filename);
        } else {
            await this.deleteFromLocal(filename);
        }
    }

    async deleteFromLocal(filename) {
        try {
            const filePath = path.join(STORAGE_CONFIG.local.attachmentsDir, filename);
            await fs.unlink(filePath);
            console.log(`🗑️ [LOCAL] Deleted: ${filename}`);
        } catch (error) {
            console.error(`Error deleting ${filename}:`, error);
        }
    }

    async deleteFromSharePoint(filename) {
        console.error(`SharePoint deletion not implemented for ${filename}`);
    }

    async ensureAttachmentsDir() {
        try {
            await fs.access(STORAGE_CONFIG.local.attachmentsDir);
        } catch {
            await fs.mkdir(STORAGE_CONFIG.local.attachmentsDir, { recursive: true });
            console.log('📁 Created attachments directory:', STORAGE_CONFIG.local.attachmentsDir);
        }
    }

    // Backward compatibility
    getLocalAttachmentPath(filename) {
        return this.getFromLocal(filename);
    }
}

const attachmentStorage = new AttachmentStorage();

const fileService = {
    saveAttachment: (attachment) => attachmentStorage.saveAttachment(attachment),
    getAttachment: (filename, provider) => attachmentStorage.getAttachment(filename, provider),
    deleteAttachment: (filename, provider) => attachmentStorage.deleteAttachment(filename, provider),
    ensureAttachmentsDir: () => attachmentStorage.ensureAttachmentsDir(),
    getLocalAttachmentPath: (filename) => attachmentStorage.getLocalAttachmentPath(filename),
};

module.exports = fileService;
