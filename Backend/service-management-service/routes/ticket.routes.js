const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Config ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => { cb(null, uploadDir); },
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
		cb(null, uniqueSuffix + '-' + cleanName);
	}
});
const upload = multer({ storage: storage });

// =============================================================================
// ✅ 1. FILE ROUTES (Must be first)
// =============================================================================
router.get('/attachments/:attachmentId/download', ticketController.downloadAttachment);
router.get('/files/:filename', ticketController.downloadFileByName);

// =============================================================================
// ✅ 2. STANDARD ROUTES
// =============================================================================
router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);

// Param Routes
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Attachments
router.post('/:id/attachments', upload.single('file'), ticketController.uploadAttachment);
router.get('/:id/attachments', ticketController.getAttachments);

// Notes & Activities
router.post('/:id/notes', ticketController.createNote);
router.get('/:id/notes', ticketController.getNotes);
router.get('/:id/activities', ticketController.getActivities);
router.post('/:id/activities', ticketController.createActivity);

// Email
router.get('/:id/emails', ticketController.getEmails);
router.post('/:id/emails', ticketController.sendEmail);
router.post('/:id/emails/with-attachments', upload.array('files'), ticketController.sendEmail);
router.post('/:id/emails/draft', ticketController.saveDraft);
router.delete('/:id/emails/:emailId', ticketController.deleteEmail);

module.exports = router;