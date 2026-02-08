// D:\Galvinus\CRM\CRM-main\Backend-Ser\routes\email.routes.js

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

const upload = multer({ storage: storage });

// ─────────────────────────────────────────────────────────────────────────────
// ✅ THESE ROUTES MUST MATCH "http://localhost:4007/ser/api/..."
// ─────────────────────────────────────────────────────────────────────────────

// 1. Fetch Emails
router.get('/tickets/:ticketId/emails', emailController.getTicketEmails);

// 2. Send Email (Plain Text)
router.post('/tickets/:ticketId/emails', emailController.sendEmail);

// 3. Send Email (With Attachments) - THIS WAS GIVING 404
router.post('/tickets/:ticketId/emails/with-attachments', upload.array('files'), emailController.sendEmail);

module.exports = router;
