// D:\Galvinus\CRM\CRM-main\Backend-Ser\controllers\email.controller.js

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Ensure this URL is correct. If running locally, it is usually 4006.
const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_API_URL || 'http://localhost:4006/am/api';

/**
 * GET /tickets/:ticketId/emails
 */
exports.getTicketEmails = async (req, res) => {
	const { ticketId } = req.params;

	try {
		// 1. Fetch Local Email Logs (Created directly in Ticket Service)
		const localEmails = await prisma.emailLog.findMany({
			where: { ticket_id: ticketId },
			orderBy: { created_at: 'desc' }
		});

		// 2. Fetch Remote Emails from Activity Service
		let remoteEmails = [];
		try {
			// We search for emails linked to this Ticket ID in the Activity Service
			const response = await axios.get(`${ACTIVITY_SERVICE_URL}/emails/external/${ticketId}`);
			if (response.data && response.data.success) {
				remoteEmails = response.data.data;
			}
		} catch (apiError) {
			console.warn("⚠️ Activity Service Fetch Error:", apiError.message);
		}

		// 3. Normalize Remote Emails to match Frontend Expectations
		const normalizedRemote = remoteEmails.map(rem => {
			// Determine type based on sender (simple logic)
			const isOutbound = rem.sender && (rem.sender.includes('Current User') || rem.sender.includes('Support'));

			return {
				id: rem.id || `REM-${Date.now()}`,
				ticket_id: ticketId,
				channel: 'Email',
				subject: rem.subject,
				sender: rem.sender,
				recipient: rem.recipient,
				// CRITICAL FIX: Map 'content' (Activity DB) to 'body' (Frontend Expectation)
				body: rem.content || rem.htmlContent || rem.body || "(No Content)",
				type: isOutbound ? 'outbound' : 'inbound',
				created_at: rem.receivedAt || rem.createdAt,
				source: 'ACTIVITY_SERVICE',
				attachments: rem.attachments || []
			};
		});

		// 4. Merge & Deduplicate
		// We filter out remote emails that look exactly like local ones (same subject & created within 5 seconds)
		// to prevent double entry in the list if the sync was successful.
		const uniqueRemote = normalizedRemote.filter(remote => {
			const duplicate = localEmails.find(local =>
				local.subject === remote.subject &&
				Math.abs(new Date(local.created_at) - new Date(remote.created_at)) < 5000
			);
			return !duplicate;
		});

		const merged = [...localEmails, ...uniqueRemote].sort((a, b) =>
			new Date(b.created_at) - new Date(a.created_at)
		);

		res.status(200).json(merged);

	} catch (error) {
		console.error('Error fetching ticket emails:', error);
		res.status(500).json({ message: 'Failed to fetch emails' });
	}
};

/**
 * POST /tickets/:ticketId/emails (Send)
 */
exports.sendEmail = async (req, res) => {
	const { ticketId } = req.params;
	let { recipient, to, subject, body, type = 'outbound' } = req.body;
	const finalRecipient = recipient || to;
	const files = req.files || [];

	if (!finalRecipient || !subject || !body) {
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		// ✅ STEP 0: Fetch Ticket Details to get Account/Contact info
		// We need this to sync metadata to the Activity Service so columns don't appear empty
		let ticketData = null;
		try {
			ticketData = await prisma.ticket.findUnique({
				where: { ticket_id: ticketId }
			});
		} catch (err) {
			console.warn("Could not fetch ticket details for metadata sync:", err.message);
		}

		// 1. Local Save (Ticket Service DB)
		const newEmailLog = await prisma.emailLog.create({
			data: {
				ticket_id: ticketId,
				subject,
				sender: "Current User",
				recipient: finalRecipient,
				body,
				type
			}
		});

		// 2. Attachments (Ticket Service DB) - EXACT LOGIC PRESERVED
		if (files.length > 0) {
			await prisma.attachment.createMany({
				data: files.map(f => ({
					ticket_id: ticketId,
					file_name: f.filename,
					original_name: f.originalname,
					file_path: f.path,
					file_size: String(f.size),
					mime_type: f.mimetype,
					uploaded_by: "Current User"
				}))
			});
		}

		// 3. Sync to Activity Service
		// ✅ UPDATED: Now sends ticketId, accountId, contactId, and priority
		try {
			await axios.post(`${ACTIVITY_SERVICE_URL}/emails/log-external`, {
				// IDs
				ticketId: ticketId, // Send explicitly as ticketId
				externalId: ticketId, // Keep for backward compatibility
				accountId: ticketData?.account_id || null,
				contactId: ticketData?.primary_contact_id || null,

				// Metadata
				subject,
				sender: "Current User",
				recipient: finalRecipient,
				content: body,
				status: 'READ', // Outbound emails are considered read
				priority: ticketData?.priority || 'MEDIUM',
				relatedObject: 'Ticket',

				// Attachments metadata for syncing
				attachments: files.map(f => ({
					filename: f.filename,
					original_name: f.originalname,
					path: f.path,
					mimetype: f.mimetype,
					size: f.size
				}))
			});
		} catch (e) {
			console.error("Sync to Activity Service failed:", e.message);
			// We do NOT fail the request if sync fails, as the email is saved locally.
		}

		res.status(200).json(newEmailLog);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to send' });
	}
};