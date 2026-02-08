const emailService = require('../services/emailService');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// --- CONFIGURATION ---
const AC_ATTACHMENTS_DIR = path.resolve(__dirname, '../attachments');
if (!fs.existsSync(AC_ATTACHMENTS_DIR)) fs.mkdirSync(AC_ATTACHMENTS_DIR, { recursive: true });

// ✅ HELPER: SMART CORE FINDER (Ignores Timestamps & Separators)
const findFileSmart = (filename, providedPath = null) => {
    if (!filename) return null;
    const cleanName = path.basename(filename);
    
    // 1. Direct Hit Check (Fastest)
    if (providedPath && fs.existsSync(providedPath)) {
        console.log(`   ✅ [Direct Hit] ${providedPath}`);
        return providedPath;
    }

    // 2. Define Search Scope (Go up to Project Root)
    const projectRoot = path.resolve(__dirname, '../../../../'); 
    const IGNORE_DIRS = ['node_modules', '.git', '.vscode', 'dist', 'build', 'coverage', 'logs'];

    // 3. Extract "Core Name" (Remove timestamp prefixes like "12345-" or "12345_")
    // Example: "1769-image.png" -> "image.png"
    const coreName = cleanName.replace(/^[\d\-_]+\.?/, '').toLowerCase();
    
    console.log(`🔍 [Smart Search] Target: "${cleanName}" -> Core: "${coreName}"`);

    // 4. Recursive Scanner
    const findInDir = (dir, depth = 0) => {
        if (depth > 6) return null; // Prevent infinite loops
        if (!fs.existsSync(dir)) return null;

        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    // Only dive into relevant folders to speed up search
                    if (!IGNORE_DIRS.includes(item.name)) {
                        const result = findInDir(fullPath, depth + 1);
                        if (result) return result;
                    }
                } else if (item.isFile()) {
                    const itemName = item.name.toLowerCase();

                    // A. Exact Match
                    if (itemName === cleanName.toLowerCase()) return fullPath;

                    // B. Core Match (The Fix!)
                    // If disk file is "999-image.png" and we want "image.png", this matches.
                    if (coreName.length > 3 && itemName.endsWith(coreName)) {
                        console.log(`   ✅ [Fuzzy Hit] Found: ${fullPath}`);
                        return fullPath;
                    }
                }
            }
        } catch (e) { /* Ignore access errors */ }
        return null;
    };

    return findInDir(projectRoot);
};

const emailController = {
  // ... (Keep existing CRUD: syncEmails, getAllEmails, etc.) ...
  syncEmails: async (req, res) => { try { const emails = await emailService.syncEmails(); res.status(200).json(emails); } catch (e) { res.status(500).json({ error: e.message }); } },
  getAllEmails: async (req, res) => { try { const r = await emailService.getAllEmails(req.query); res.status(200).json({ data: r }); } catch (e) { res.status(500).json({ error: e.message }); } },
  getEmailById: async (req, res) => { try { const e = await emailService.getEmailById(req.params.id); if (!e) return res.status(404).json({ message: 'Not Found' }); res.status(200).json({ data: e }); } catch (e) { res.status(500).json({ error: e.message }); } },
  updateEmailStatus: async (req, res) => { try { const u = await emailService.updateEmailStatus(req.params.id, req.body.status); res.status(200).json({ data: u }); } catch (e) { res.status(500).json({ error: e.message }); } },
  bulkUpdateStatus: async (req, res) => { try { const r = await emailService.bulkUpdateEmailStatus(req.body.ids, req.body.status); res.status(200).json(r); } catch (e) { res.status(500).json({ error: e.message }); } },
  markEmailAsRead: async (req, res) => { try { await emailService.markAsRead(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } },
  sendAutoReply: async (req, res) => { try { await emailService.sendAutoReply(req.params.id, req.body.message); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } },
  getEmailStats: async (req, res) => { try { const s = await emailService.getEmailStats(); res.json({ data: s }); } catch (e) { res.status(500).json({ error: e.message }); } },
  deleteEmail: async (req, res) => { try { await prisma.email.delete({ where: { id: req.params.id } }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } },

  // ✅ 1. DOWNLOAD BY ID (Smart Core Match)
  downloadAttachment: async (req, res) => {
    try {
      const { id } = req.params;
      const attachment = await prisma.attachment.findUnique({ where: { id } });
      if (!attachment) return res.status(404).json({ message: 'Record not found' });

      // Search using ANY available identifier
      const realPath = findFileSmart(attachment.filename, attachment.path) 
                    || findFileSmart(attachment.original_name);

      if (realPath) {
          // Serve the file with its original clean name
          return res.download(realPath, attachment.original_name || attachment.filename);
      }
      
      console.warn(`[Download 404] ID: ${id} | Name: ${attachment.filename}`);
      res.status(404).json({ message: 'File not found on server' });
    } catch (e) { 
      console.error(e);
      res.status(500).send("Download Error"); 
    }
  },

  // ✅ 2. DOWNLOAD BY NAME (Smart Core Match)
  downloadFileByName: async (req, res) => {
      try {
          const rawName = decodeURIComponent(req.params.filename);
          const realPath = findFileSmart(rawName);

          if (realPath) {
              return res.download(realPath, rawName);
          }
          
          console.warn(`[File 404] Name: ${rawName}`);
          res.status(404).json({ message: "File not found" });
      } catch (e) { res.status(500).send("Error"); }
  },

  // ✅ 3. LOG EXTERNAL (Robust Copy)
  logExternalEmail: async (req, res) => {
    try {
      const { 
        ticketId, accountId, contactId, opportunityId, // IDs from other services
        subject, content, sender, recipient, 
        status = 'READ', 
        priority = 'MEDIUM', // Default priority
        relatedObject,       // e.g., "Ticket", "Lead"
        attachments, 
        previousDraftId 
      } = req.body;

      // Clean up previous draft if this is the final sent email
      if (previousDraftId && status !== 'DRAFT') {
          try { await prisma.email.delete({ where: { id: previousDraftId } }); } catch(e) {}
      }

      const processedAttachments = [];
      if (attachments && attachments.length > 0) {
          for (const att of attachments) {
              // Smart search for the file
              const sourcePath = findFileSmart(att.path) 
                              || findFileSmart(att.storedFilename)
                              || findFileSmart(att.filename);

              if (sourcePath) {
                  const uniqueName = `${Date.now()}_${path.basename(att.filename).replace(/[^a-zA-Z0-9.]/g, "_")}`;
                  const destPath = path.join(AC_ATTACHMENTS_DIR, uniqueName);
                  try {
                      fs.copyFileSync(sourcePath, destPath);
                      processedAttachments.push({ 
                          filename: uniqueName, 
                          original_name: att.filename, 
                          path: destPath, 
                          contentType: att.mimetype || att.contentType, 
                          size: Number(att.size), 
                          storageProvider: 'local' 
                      });
                  } catch (err) {
                      processedAttachments.push({ ...att, path: sourcePath, size: Number(att.size), storageProvider: 'local' });
                  }
              } else {
                  console.error(`[Attachment Missing] ${att.filename}`);
                  processedAttachments.push({ ...att, size: Number(att.size), storageProvider: 'local' });
              }
          }
      }

      // Determine Related Object string if not provided
      let finalRelatedObject = relatedObject;
      if (!finalRelatedObject) {
          if (ticketId) finalRelatedObject = "Ticket";
          else if (opportunityId) finalRelatedObject = "Opportunity";
          else if (accountId) finalRelatedObject = "Account";
          else if (contactId) finalRelatedObject = "Contact";
      }

      const email = await prisma.email.create({
        data: {
          subject: subject || "(No Subject)", 
          content: content || "", 
          sender: sender || "System", 
          recipient: recipient || "", 
          status: status, 
          priority: priority, // ✅ Save Priority
          isExternal: true, 
          ticketId: ticketId || null, 
          accountId: accountId || null, // ✅ Save Account ID
          contactId: contactId || null, // ✅ Save Contact ID
          opportunityId: opportunityId || null,
          relatedObject: finalRelatedObject, // ✅ Save "Ticket" string for UI
          receivedAt: new Date(),
          attachments: { 
            create: processedAttachments.map(att => ({ 
                filename: att.filename, 
                path: att.path, 
                contentType: att.contentType || att.mimetype, 
                size: att.size, 
                storageProvider: att.storageProvider 
            })) 
          }
        },
        include: { attachments: true }
      });
      res.status(201).json(email);
    } catch (e) { 
        console.error("Log External Error:", e);
        res.status(500).json({ error: e.message }); 
    }
  },
  getEmailsByExternalId: async (req, res) => {
    try {
      const { externalId } = req.params;
      const emails = await prisma.email.findMany({ where: { OR: [{ ticketId: externalId }, { subject: { contains: externalId, mode: 'insensitive' } }] }, include: { attachments: true }, orderBy: { createdAt: 'desc' } });
      res.status(200).json({ success: true, data: emails });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },
};

module.exports = emailController;