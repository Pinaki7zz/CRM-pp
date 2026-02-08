const leadService = require("../services/leadService");
const { uploadToS3 } = require("../utils/s3");

exports.createLead = async (req, res) => {
	try {
		console.log("BODY:", req.body);
		console.log("FILE:", req.file);

		let leadImageUrl = null;

		// 🔹 Upload image if present
		if (req.file) {
			leadImageUrl = await uploadToS3(req.file);
		}

		const leadInfo = {
			...req.body,
			leadStatus: req.body.leadStatus ?? "OPEN",
			budget: req.body.budget ? Number(req.body.budget) : null,
			potentialRevenue: req.body.potentialRevenue
				? Number(req.body.potentialRevenue)
				: null,
			dateOfBirth: req.body.dateOfBirth
				? new Date(req.body.dateOfBirth)
				: null,
			leadImageUrl,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const lead = await leadService.createLead(leadInfo);
		res.status(201).json(lead);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.convertLead = async (req, res) => {
	try {
		const result = await leadService.convertLead(req.params.id);
		return res.json(result);
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Lead conversion failed",
		});
	}
};

exports.uploadLeadAttachments = async (req, res) => {
	try {
		const attachments = await leadService.uploadLeadAttachments(
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

exports.getAllLeads = async (req, res) => {
	try {
		const leads = await leadService.getAllLeads();
		res.status(200).json(leads);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.getAllLeadsPaginated = async (req, res) => {
	try {
		const result = await leadService.getAllLeadsPaginated({
			...req.query
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getLeadsExportedInCsv = async (req, res) => {
	try {
		const leads = await leadService.getAllLeads();  // fetch all leads

		if (!leads || leads.length === 0) {
			return res.status(200).send("No lead found");
		}

		// Header row
		let csv = "Lead ID,First Name,Last Name,Status,Company,Email,Created At\n";

		// Rows
		csv += leads
			.map(lead => {
				const email = lead.email ?? lead.secondaryEmail ?? "";
				return `${lead.leadId},${lead.firstName},${lead.lastName},${lead.leadStatus},${lead.company},${email},${lead.createdAt}`;
			})
			.join("\n");

		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=leads.csv");

		return res.status(200).send(csv);

	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to export CSV" });
	}
};

exports.getLeadById = async (req, res) => {
	try {
		const lead = await leadService.getLeadById(req.params.id);
		if (!lead) {
			return res.status(404).json({ message: "Lead not found" });
		}
		return res.json({
			...lead,
			attachments: lead.leadAttachments   // 👈 map to frontend key
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

exports.getNextLeadId = async (req, res) => {
	try {
		const leadId = await leadService.getNextLeadId();
		res.status(200).json({ leadId });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.updateLead = async (req, res) => {
	try {
		console.log("BODY:", req.body);
		console.log("FILE:", req.file);

		let leadImageUrl = null;

		// 🔹 Upload image if present
		if (req.file) {
			leadImageUrl = await uploadToS3(req.file);
		}

		const leadInfo = {
			...req.body,
			leadStatus: req.body.leadStatus ?? "OPEN",
			budget: req.body.budget ? Number(req.body.budget) : null,
			potentialRevenue: req.body.potentialRevenue
				? Number(req.body.potentialRevenue)
				: null,
			dateOfBirth: req.body.dateOfBirth
				? new Date(req.body.dateOfBirth)
				: null,
			leadImageUrl,
			createdAt: new Date().toISOString(),
		};

		const lead = await leadService.updateLead(req.params.id, leadInfo);
		res.status(200).json(lead);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.deleteLead = async (req, res) => {
	try {
		await leadService.deleteLead(req.params.id);
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.deleteLeadAttachment = async (req, res) => {
	try {
		const { leadId, attachmentId } = req.params;
		await leadService.deleteLeadAttachment(leadId, attachmentId);
		return res.status(204).json({ message: "Attachment deleted" });
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Failed to delete attachment",
		});
	}
};
