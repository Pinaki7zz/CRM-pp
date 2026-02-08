const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const path = require('path');
const emailService = require('./email.service');

const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_API_URL || 'http://localhost:4006/am/api';

async function generateTicketId() {
	const today = new Date();
	const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
	const latest = await prisma.ticket.findFirst({
		where: { ticket_id: { startsWith: `TK-${dateStr}` } },
		orderBy: { ticket_id: 'desc' }
	});
	let seq = 0;
	if (latest) seq = parseInt(latest.ticket_id.slice(-3)) || 0;
	return `TK-${dateStr}${(seq + 1).toString().padStart(3, '0')}`;
}

const ticketService = {
	// 1. STANDARD TICKET CRUD
	createTicket: async (data) => {
		const ticket_id = await generateTicketId();
		return await prisma.ticket.create({
			data: { ...data, ticket_id, status: data.status || "OPEN", source: data.source || "MANUAL" }
		});
	},
	getTickets: async () => prisma.ticket.findMany({ orderBy: { created_at: 'desc' } }),
	getTicketById: async (id) => prisma.ticket.findUnique({ where: { ticket_id: id } }),
	updateTicket: async (id, data) => prisma.ticket.update({ where: { ticket_id: id }, data }),
	deleteTicket: async (id) => prisma.ticket.delete({ where: { ticket_id: id } }),

	// 2. RELATIONS
	getActivities: async (ticketId) => prisma.agentActivity.findMany({ where: { ticket_id: ticketId }, orderBy: { timestamp: 'desc' } }),
	getNotes: async (ticketId) => prisma.note.findMany({ where: { ticket_id: ticketId }, orderBy: { created_at: 'desc' } }),
	getAttachments: async (ticketId) => prisma.attachment.findMany({ where: { ticket_id: ticketId }, orderBy: { created_at: 'desc' } }),
	addActivity: async (ticketId, data) => prisma.agentActivity.create({ data: { ticket_id: ticketId, action: data.action, details: data.details, agentName: data.agentName || "System" } }),
	addNote: async (ticketId, data) => prisma.note.create({ data: { ticket_id: ticketId, text: data.text, author: data.author } }),
	addAttachment: async (ticketId, file, uploadedBy) => {
		return await prisma.attachment.create({
			data: {
				ticket_id: ticketId,
				file_name: file.filename,
				original_name: file.originalname,
				file_path: file.path,
				file_size: String(file.size),
				mime_type: file.mimetype,
				uploaded_by: uploadedBy || 'System'
			}
		});
	},

	// 3. EMAIL INTEGRATION
	getEmails: async (ticketId) => {
		try {
			const res = await axios.get(`${ACTIVITY_SERVICE_URL}/emails/external/${ticketId}`);
			if (res.data && res.data.success) return res.data.data;
			if (Array.isArray(res.data)) return res.data;
			return [];
		} catch (e) { return []; }
	},

	// ✅ FIXED: Send 'storedFilename' to Activity Service
	sendEmail: async (ticketId, emailData, files) => {
		const ticket = await prisma.ticket.findUnique({ where: { ticket_id: ticketId } });
		if (!ticket) throw new Error("Ticket not found");

		// A. Send via Nodemailer
		await emailService.sendEmail({
			to: emailData.recipient,
			cc: emailData.cc,
			subject: emailData.subject,
			body: emailData.body,
			attachments: files
		});

		// B. Prepare Metadata
		const attMeta = files ? files.map(f => ({
			filename: f.originalname, // Display Name
			storedFilename: f.filename, // ✅ ACTUAL DISK NAME (Critical for lookup)
			path: f.path, // Absolute Path
			mimetype: f.mimetype,
			size: f.size
		})) : [];

		// C. Sync to Activity Service
		const payload = {
			externalId: ticketId,
			ticketId: ticket.ticket_id,
			subject: emailData.subject,
			content: emailData.body,
			sender: "System",
			recipient: emailData.recipient,
			status: 'READ',
			type: 'outbound',
			attachments: attMeta
		};

		try {
			await axios.post(`${ACTIVITY_SERVICE_URL}/emails/log-external`, payload);
		} catch (e) {
			console.error("Failed to log email to Activity Service:", e.message);
		}

		await ticketService.addActivity(ticketId, {
			action: "Email Sent",
			details: `To: ${emailData.recipient}, Subject: ${emailData.subject}`,
			agentName: "System"
		});

		return { success: true };
	},

	saveDraft: async (ticketId, draftData) => {
		const payload = {
			externalId: draftData.draftId,
			ticketId: ticketId,
			subject: draftData.subject,
			content: draftData.body,
			recipient: draftData.recipient || draftData.to,
			sender: "Current User",
			status: 'DRAFT',
			type: 'draft'
		};
		const res = await axios.post(`${ACTIVITY_SERVICE_URL}/emails/log-external`, payload);
		return res.data;
	},

	deleteEmail: async (id) => {
		const res = await axios.delete(`${ACTIVITY_SERVICE_URL}/emails/${id}`);
		return res.data;
	}
};

module.exports = ticketService;