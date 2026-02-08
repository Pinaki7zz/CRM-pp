const opportunityService = require("../services/opportunityService");
const axios = require("axios");

exports.createOpportunity = async (req, res) => {
	try {
		const opportunityInfo = {
			...req.body,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		const opportunity = await opportunityService.createOpportunity(opportunityInfo);
		res.status(201).json(opportunity);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.uploadOpportunityAttachments = async (req, res) => {
	try {
		const attachments = await opportunityService.uploadOpportunityAttachments(
			req.params.id,
			req.files
		);
		return res.status(201).json(attachments);
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Attachment upload failed",
		});
	}
};

exports.addOpportunityNote = async (req, res) => {
	try {
		const { id } = req.params;
		const { text, author } = req.body;
		if (!text || !text.trim()) {
			return res.status(400).json({ message: "Note text is required" });
		}
		const note = await opportunityService.addOpportunityNote(id, text, author);
		return res.status(201).json(note);
	} catch (err) {
		console.error("Error saving note", err);
		return res.status(500).json({ message: "Failed to save note" });
	}
};

exports.getAllOpportunities = async (req, res) => {
	try {
		const opportunities = await opportunityService.getAllOpportunities();
		res.status(200).json(opportunities);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllOpportunitiesPaginated = async (req, res) => {
	try {
		const result = await opportunityService.getAllOpportunitiesPaginated({
			...req.query
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllOpportunityIdsNames = async (req, res) => {
	try {
		const opportunities = await opportunityService.getAllOpportunityIdsNames();
		res.status(200).json(opportunities);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getOpportunitiesExportedInCsv = async (req, res) => {
	try {
		const opportunities = await opportunityService.getAllOpportunities();

		if (!opportunities || opportunities.length === 0) {
			return res.status(200).send("No opportunity found");
		}

		// Fetch accounts from Spring Boot service
		const accountsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/account`);
		const accounts = accountsRes.data;

		// Fetch contacts from Spring Boot service
		const contactsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/contact`);
		const contacts = contactsRes.data;

		// Build lookup maps
		const accountMap = {};
		accounts.forEach(a => {
			accountMap[a.accountId] = a.name;
		});

		const contactMap = {};
		contacts.forEach(c => {
			contactMap[c.contactId] = `${c.firstName} ${c.lastName}`;
		});

		// Header
		let csv = "Opportunity Name,Account Name,Contact Name,Stage,Created At\n";

		// Rows
		csv += opportunities
			.map(opp => {
				const accountName = accountMap[opp.accountId] || "--";
				const contactName = contactMap[opp.primaryContactId] || "--";

				return `${opp.name},${accountName},${contactName},${opp.stage},${opp.createdAt}`;
			})
			.join("\n");

		// Response headers
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=opportunities.csv"
		);

		return res.status(200).send(csv);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to export CSV" });
	}
};

exports.getOpportunityById = async (req, res) => {
	try {
		const opportunity = await opportunityService.getOpportunityById(req.params.id);
		if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
		res.status(200).json(opportunity);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.updateOpportunity = async (req, res) => {
	try {
		const opportunityInfo = {
			...req.body,
			amount: parseFloat(req.body.amount),
			probability: parseInt(req.body.probability),
			startDate: req.body.startDate ? new Date(req.body.startDate).toISOString() : null,
			endDate: req.body.endDate ? new Date(req.body.endDate).toISOString() : null,
			updatedAt: new Date().toISOString(),
		};
		const opportunity = await opportunityService.updateOpportunity(req.params.id, opportunityInfo);
		res.status(200).json(opportunity);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteOpportunity = async (req, res) => {
	try {
		await opportunityService.deleteOpportunity(req.params.id);
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteOpportunityAttachment = async (req, res) => {
	try {
		const { oppId, attachmentId } = req.params;
		await opportunityService.deleteOpportunityAttachment(oppId, attachmentId);
		return res.status(204).json({ message: "Attachment deleted" });
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Failed to delete attachment",
		});
	}
};

exports.deleteOpportunityNote = async (req, res) => {
	try {
		const { noteId } = req.params;
		await opportunityService.deleteOpportunityNote(noteId);
		return res.json({ message: "Note deleted" });
	} catch (err) {
		console.error("Error deleting note", err);
		return res.status(500).json({ message: "Failed to delete note" });
	}
};
