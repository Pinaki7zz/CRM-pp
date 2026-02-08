const salesQuoteService = require("../services/salesQuoteService");
const axios = require("axios");

exports.createSalesQuote = async (req, res) => {
	try {
		const { quoteData, items } = req.body;
		const result = await salesQuoteService.createSalesQuote(
			quoteData,
			items
		);
		res.status(201).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.convertSalesQuote = async (req, res) => {
	try {
		const result = await salesQuoteService.convertSalesQuote(req.params.id);
		return res.json(result);
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Lead conversion failed",
		});
	}
};

exports.uploadSalesQuoteAttachments = async (req, res) => {
	try {
		const attachments = await salesQuoteService.uploadSalesQuoteAttachments(
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

exports.addSalesQuoteNote = async (req, res) => {
	try {
		const { id } = req.params;
		const { text, author } = req.body;
		if (!text || !text.trim()) {
			return res.status(400).json({ message: "Note text is required" });
		}
		const note = await salesQuoteService.addSalesQuoteNote(id, text, author);
		return res.status(201).json(note);
	} catch (err) {
		console.error("Error saving note", err);
		return res.status(500).json({ message: "Failed to save note" });
	}
};

exports.getAllSalesQuotes = async (req, res) => {
	try {
		const salesQuotes = await salesQuoteService.getAllSalesQuotes();
		res.status(200).json(salesQuotes);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllSalesQuotesPaginated = async (req, res) => {
	try {
		const result = await salesQuoteService.getAllSalesQuotesPaginated({
			...req.query
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getSalesQuotesExportedInCsv = async (req, res) => {
	try {
		const salesQuotes = await salesQuoteService.getAllSalesQuotes();

		if (!salesQuotes || salesQuotes.length === 0) {
			return res.status(200).send("No sales quote found");
		}

		// Fetch Accounts
		const accountsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/account`);
		const accounts = accountsRes.data;

		// Fetch Contacts
		const contactsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/contact`);
		const contacts = contactsRes.data;

		// Fetch Users (Quote Owners)
		const usersRes = await axios.get(`${process.env.USER_MANAGEMENT_URL}/users/s-info`);
		const users = usersRes.data;

		// Build lookup maps
		const accountMap = {};
		accounts.forEach(a => {
			accountMap[a.accountId] = a.name;
		});

		const contactMap = {};
		contacts.forEach(c => {
			contactMap[c.contactId] = `${c.firstName} ${c.lastName}`;
		});

		const ownerMap = {};
		users.forEach(u => {
			ownerMap[u.id] = `${u.firstName} ${u.lastName}`;
		});

		// Header
		let csv = "Quote ID,Quote Name,Status,Account Name,Contact Name,Opportunity Name,Owner Name,Grand Total,Created At\n";

		// Rows
		csv += salesQuotes
			.map(q => {
				const accountName = accountMap[q.accountId] || "--";
				const contactName = contactMap[q.primaryContactId] || "--";
				const oppName = q.opportunity?.name || "--";
				const ownerName = ownerMap[q.quoteOwnerId] || "--";

				const grandTotal = q.items
					? q.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
					: 0;

				return [
					q.quoteId,
					q.name,
					q.status,
					accountName,
					contactName,
					oppName,
					ownerName,
					grandTotal.toFixed(2),
					q.createdAt
				].join(",");
			})
			.join("\n");

		// Response headers
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=sales-quotes.csv");

		return res.status(200).send(csv);

	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to export CSV" });
	}
};

exports.generateSalesQuotePdf = async (req, res) => {
	try {
		const pdfBuffer = await salesQuoteService.generateSalesQuotePdf(
			req.params.id
		);
		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": "inline; filename=sales_quote.pdf",
		});
		return res.send(pdfBuffer);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to generate PDF" });
	}
};

exports.getSalesQuoteById = async (req, res) => {
	try {
		const salesQuote = await salesQuoteService.getSalesQuoteById(req.params.id);
		if (!salesQuote) return res.status(404).json({ message: "SalesQuote not found" });
		res.status(200).json(salesQuote);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getNextQuoteId = async (req, res) => {
	try {
		const quoteId = await salesQuoteService.getNextQuoteId();
		res.status(200).json({ quoteId });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.updateSalesQuote = async (req, res) => {
	try {
		const { quoteData, items } = req.body;
		const result = await salesQuoteService.updateSalesQuote(
			req.params.id,
			quoteData,
			items
		);
		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteSalesQuote = async (req, res) => {
	try {
		await salesQuoteService.deleteSalesQuote(req.params.id);
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteSalesQuoteAttachment = async (req, res) => {
	try {
		const { sqId, attachmentId } = req.params;
		await salesQuoteService.deleteSalesQuoteAttachment(sqId, attachmentId);
		return res.status(204).json({ message: "Attachment deleted" });
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Failed to delete attachment",
		});
	}
};

exports.deleteSalesQuoteNote = async (req, res) => {
	try {
		const { noteId } = req.params;
		await salesQuoteService.deleteSalesQuoteNote(noteId);
		return res.json({ message: "Note deleted" });
	} catch (err) {
		console.error("Error deleting note", err);
		return res.status(500).json({ message: "Failed to delete note" });
	}
};
