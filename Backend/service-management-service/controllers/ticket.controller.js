const ticketService = require('../services/ticket.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// ✅ HELPER: SMART CORE FINDER
const findFileSmart = (filename, providedPath = null) => {
	if (!filename) return null;
	const cleanName = path.basename(filename);

	if (providedPath && fs.existsSync(providedPath)) return providedPath;

	const projectRoot = path.resolve(__dirname, '../../../../');
	const coreName = cleanName.replace(/^[\d\-_]+\.?/, '').toLowerCase();
	const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'logs'];

	const findInDir = (dir, depth = 0) => {
		if (depth > 6) return null;
		if (!fs.existsSync(dir)) return null;

		try {
			const items = fs.readdirSync(dir, { withFileTypes: true });
			for (const item of items) {
				const fullPath = path.join(dir, item.name);
				if (item.isDirectory()) {
					if (!IGNORE_DIRS.includes(item.name)) {
						const res = findInDir(fullPath, depth + 1);
						if (res) return res;
					}
				} else if (item.isFile()) {
					const itemName = item.name.toLowerCase();
					if (itemName === cleanName.toLowerCase()) return fullPath;
					if (coreName.length > 3 && itemName.endsWith(coreName)) return fullPath;
				}
			}
		} catch (e) { }
		return null;
	};
	return findInDir(projectRoot);
};

const ticketController = {
	// ... (Keep existing CRUD methods unchanged) ...
	createTicket: async (req, res) => { try { const t = await ticketService.createTicket(req.body); res.status(201).json(t); } catch (e) { res.status(500).json({ message: e.message }); } },
	getTickets: async (req, res) => { try { const t = await ticketService.getTickets(req.query); res.json(t); } catch (e) { res.status(500).json({ message: e.message }); } },
	getTicketById: async (req, res) => { try { const t = await ticketService.getTicketById(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' }); res.json(t); } catch (e) { res.status(500).json({ message: e.message }); } },
	updateTicket: async (req, res) => { try { const t = await ticketService.updateTicket(req.params.id, req.body); res.json(t); } catch (e) { res.status(500).json({ message: e.message }); } },
	deleteTicket: async (req, res) => { try { await ticketService.deleteTicket(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); } },

	// ✅ 1. DOWNLOAD BY ID (Smart Match)
	downloadAttachment: async (req, res) => {
		try {
			const { attachmentId } = req.params;
			const att = await prisma.attachment.findUnique({ where: { id: attachmentId } });
			if (!att) return res.status(404).json({ message: 'Record not found' });

			const realPath = findFileSmart(att.file_name, att.file_path) || findFileSmart(att.original_name);

			if (realPath) return res.download(realPath, att.original_name || att.file_name);

			res.status(404).json({ message: 'File not found on disk' });
		} catch (e) { res.status(500).json({ message: 'Download failed' }); }
	},

	// ✅ 2. DOWNLOAD BY NAME (Smart Match)
	downloadFileByName: async (req, res) => {
		try {
			const rawName = decodeURIComponent(req.params.filename);
			const realPath = findFileSmart(rawName);

			if (realPath) return res.download(realPath, rawName);

			res.status(404).json({ message: "File not found" });
		} catch (e) { res.status(500).json({ message: "Error" }); }
	},

	// ... (Keep other methods) ...
	uploadAttachment: async (req, res) => { try { if (!req.file) return res.status(400).json({ message: 'No file' }); const a = await ticketService.addAttachment(req.params.id, req.file, req.body.uploadedBy); res.status(201).json(a); } catch (e) { res.status(500).json({ message: e.message }); } },
	getAttachments: async (req, res) => { try { const a = await ticketService.getAttachments(req.params.id); res.json(a); } catch (e) { res.status(500).json({ message: e.message }); } },
	createNote: async (req, res) => { try { const n = await ticketService.addNote(req.params.id, req.body); res.status(201).json(n); } catch (e) { res.status(500).json({ message: e.message }); } },
	getNotes: async (req, res) => { try { const n = await ticketService.getNotes(req.params.id); res.json(n); } catch (e) { res.status(500).json({ message: e.message }); } },
	getActivities: async (req, res) => { try { const a = await ticketService.getActivities(req.params.id); res.json(a); } catch (e) { res.status(500).json({ message: e.message }); } },
	createActivity: async (req, res) => { try { const a = await ticketService.addActivity(req.params.id, req.body); res.status(201).json(a); } catch (e) { res.status(500).json({ message: e.message }); } },
	getEmails: async (req, res) => { try { const e = await ticketService.getEmails(req.params.id); res.json(e); } catch (err) { res.status(500).json({ message: err.message }); } },
	sendEmail: async (req, res) => { try { const e = await ticketService.sendEmail(req.params.id, req.body, req.files); res.status(201).json(e); } catch (err) { res.status(500).json({ message: err.message }); } },
	saveDraft: async (req, res) => { try { const d = await ticketService.saveDraft(req.params.id, req.body); res.status(201).json(d); } catch (e) { res.status(500).json({ message: e.message }); } },
	deleteEmail: async (req, res) => { try { await ticketService.deleteEmail(req.params.emailId); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({ message: e.message }); } }
};

module.exports = ticketController;