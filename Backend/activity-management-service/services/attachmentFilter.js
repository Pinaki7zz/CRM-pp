// services/attachmentFilter.js - NEW FILE FOR FILTERING IMPORTANT ATTACHMENTS
class AttachmentFilter {
    static isImportant(attachment, emailContent = '') {
        const checks = [
            this.checkFileSize(attachment),
            this.checkFilename(attachment.filename),
            this.checkMimeType(attachment.contentType, attachment.size),
            this.checkEmailContext(attachment, emailContent)
        ];
        
        // Count votes
        const importantVotes = checks.filter(check => check === true).length;
        const unimportantVotes = checks.filter(check => check === false).length;
        
        // If explicitly marked as unimportant by multiple checks, skip it
        if (unimportantVotes >= 2) return false;
        
        // If marked as important by multiple checks, keep it
        if (importantVotes >= 2) return true;
        
        // Default to important if unsure
        return true;
    }
    
    static checkFileSize(attachment) {
        const size = attachment.size || 0;
        
        // Very large files are almost always important
        if (size > 500000) return true; // 500KB+
        
        // Very small files are usually icons/logos
        if (size < 5000) return false; // 5KB-
        
        // Known icon sizes from your debug output
        const TYPICAL_ICON_SIZES = [603, 855, 897, 909, 1234, 1335, 2513, 2862];
        if (TYPICAL_ICON_SIZES.includes(size)) return false;
        
        return null; // Neutral vote
    }
    
    static checkFilename(filename) {
        const name = filename.toLowerCase();
        
        // Important patterns
        if (/(document|report|invoice|receipt|contract|pdf|doc|excel)/.test(name)) return true;
        if (/\.(pdf|doc|docx|xls|xlsx|zip|rar|txt)$/.test(name)) return true;
        if (/(whatsapp|user|upload|attachment)/.test(name)) return true;
        
        // Non-important patterns (logos, icons, branding)
        if (/(logo|icon|banner|signature|thumbnail|brand)/.test(name)) return false;
        if (/(facebook|twitter|linkedin|instagram|youtube|social)/.test(name)) return false;
        if (/_2x\.(png|jpg|gif)$/.test(name)) return false; // Retina icons
        if (/(tick|check|arrow|button|strip|header|footer)/.test(name)) return false;
        if (/(zoho|crm|mailer|group|colon)/.test(name)) return false; // Your specific branding
        
        return null; // Neutral
    }
    
    static checkMimeType(contentType, size) {
        if (!contentType) return null;
        
        // Document types are usually important
        if (contentType.includes('pdf')) return true;
        if (contentType.includes('document')) return true;
        if (contentType.includes('spreadsheet')) return true;
        if (contentType.includes('zip') || contentType.includes('compressed')) return true;
        
        // Small images are usually icons/logos
        if (contentType.startsWith('image/') && size < 50000) return false;
        
        // GIF files are usually animated icons
        if (contentType === 'image/gif') return false;
        
        return null;
    }
    
    static checkEmailContext(attachment, emailContent) {
        if (!emailContent) return null;
        
        // If referenced in HTML content, it's probably embedded (logo/icon)
        const isEmbedded = emailContent.includes(attachment.filename) ||
                          emailContent.includes('cid:') ||
                          emailContent.includes('src=');
        
        return isEmbedded ? false : true;
    }
    
    // Get reason for filtering decision (for debugging)
    static getFilterReason(attachment, emailContent = '') {
        const reasons = [];
        
        const sizeCheck = this.checkFileSize(attachment);
        if (sizeCheck === true) reasons.push(`Large file (${attachment.size} bytes)`);
        if (sizeCheck === false) reasons.push(`Small file (${attachment.size} bytes)`);
        
        const nameCheck = this.checkFilename(attachment.filename);
        if (nameCheck === true) reasons.push(`Important filename pattern`);
        if (nameCheck === false) reasons.push(`Logo/icon filename pattern`);
        
        const mimeCheck = this.checkMimeType(attachment.contentType, attachment.size);
        if (mimeCheck === true) reasons.push(`Document MIME type`);
        if (mimeCheck === false) reasons.push(`Icon/image MIME type`);
        
        const contextCheck = this.checkEmailContext(attachment, emailContent);
        if (contextCheck === true) reasons.push(`Not embedded in email`);
        if (contextCheck === false) reasons.push(`Embedded in email content`);
        
        return reasons.join('; ');
    }
}

module.exports = AttachmentFilter;
