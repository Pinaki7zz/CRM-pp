const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// =============================================================================
// ✅ 1. FILE ROUTES (Specific first!)
// =============================================================================

// 1a. Download by Database ID
router.get('/attachments/:id', emailController.downloadAttachment);

// 1b. Fallback: Download by Filename (Fixes 404 when looking up by name)
router.get('/files/:filename', emailController.downloadFileByName);


// =============================================================================
// ✅ 2. INTEGRATION ROUTES
// =============================================================================
router.post('/log-external', emailController.logExternalEmail);
router.get('/external/:externalId', emailController.getEmailsByExternalId);
router.post('/sync', emailController.syncEmails);
router.get('/stats', emailController.getEmailStats);


// =============================================================================
// ✅ 3. STANDARD CRUD
// =============================================================================
router.get('/', emailController.getAllEmails);
router.post('/bulk-status', emailController.bulkUpdateStatus);

// Generic ID routes (Must be LAST to avoid "files" being treated as an ID)
router.get('/:id', emailController.getEmailById);
router.delete('/:id', emailController.deleteEmail);
router.put('/:id/status', emailController.updateEmailStatus);
router.put('/:id/read', emailController.markEmailAsRead);
router.post('/:id/reply', emailController.sendAutoReply);

module.exports = router;