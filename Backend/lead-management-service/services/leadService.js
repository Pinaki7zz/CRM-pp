const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");
const { uploadToS3, deleteFromS3 } = require("../utils/s3");

// Helper functions
function extractNumericSuffix(leadId) {
	if (!leadId || typeof leadId !== "string") return null;
	const m = leadId.match(/(\d+)\s*$/);
	return m ? parseInt(m[1], 10) : null;
}

function computeNextLeadId(id) {
	const match = id.match(/^([A-Za-z]+)(\d+)$/);

	if (!match) return "L000001"; // defensive

	const prefix = match[1];
	const num = match[2];
	const next = (parseInt(num, 10) + 1).toString().padStart(num.length, "0");

	return `${prefix}${next}`;
}

const acClient = axios.create({
	baseURL: process.env.ACCOUNTS_CONTACTS_URL,
	timeout: 5000, // 5s hard stop
});

const normalizeEmptyStrings = (data) => {
	Object.keys(data).forEach((key) => {
		if (data[key] === "") {
			data[key] = null;
		}
	});
	return data;
};

function createError(msg, code) {
	const e = new Error(msg);
	e.statusCode = code;
	return e;
}

exports.createLead = async (data) => {
	const normalizedData = normalizeEmptyStrings(data);
	return prisma.lead.create({
		data: normalizedData,
	});
}

exports.convertLead = async (id) => {
	let createdAccountId = null;
	let createdContactId = null;

	try {
		const lead = await prisma.lead.findUnique({ where: { id } });

		if (!lead) throw createError("Lead not found", 404);
		if (lead.leadStatus === "CONVERTED")
			throw createError("Lead already converted", 400);

		// -------------------------------------------------------------
		// 1️⃣ Try to find existing account
		// -------------------------------------------------------------
		let accountId;

		try {
			const existing = await acClient.get("/account/by-name", {
				params: { name: lead.company },
			});
			accountId = existing.data.accountId;
		} catch (err) {
			if (err.response?.status !== 404) throw err;

			// -------------------------------------------------------------
			// 2️⃣ Create account ONLY IF contact creation will succeed
			//    => BUT we can't create contact without an accountId
			//    => So we must create account first BUT rollback if contact fails
			// -------------------------------------------------------------
			const created = await acClient.post("/account", {
				name: lead.company,
				website: lead.website,
				accountStatus: "ACTIVE",
				billingAddressLine1: lead.addressLine1,
				billingAddressLine2: lead.addressLine2,
				billingCity: lead.city,
				billingState: lead.state,
				billingCountry: lead.country,
				billingZipCode: lead.postalCode,
			});

			accountId = created.data.accountId;
			createdAccountId = accountId; // mark for rollback
		}

		// -------------------------------------------------------------
		// 3️⃣ Create contact — If this fails, rollback account
		// -------------------------------------------------------------
		let contactRes;

		try {
			contactRes = await acClient.post("/contact", {
				accountId, // external service expects business accountId
				firstName: lead.firstName,
				lastName: lead.lastName,
				email: lead.email,
				phone: lead.phoneNumber,
				isPrimary: false,
			});

			createdContactId = String(contactRes.data.contactId);
		} catch (contactErr) {
			// rollback newly created account
			if (createdAccountId) {
				await acClient.delete(`/account/${createdAccountId}`).catch(() => { });
			}
			throw contactErr; // rethrow
		}

		// -------------------------------------------------------------
		// 4️⃣ Convert lead + create LeadConversion
		// -------------------------------------------------------------
		await prisma.$transaction([
			prisma.lead.update({
				where: { id },
				data: { leadStatus: "CONVERTED" },
			}),
			prisma.leadConversion.create({
				data: {
					leadId: lead.id,         // ✔ FIXED — Use UUID PK
					accountId: accountId,    // saved from above
					contactId: createdContactId,
				},
			}),
		]);

		return { accountId, contactId: createdContactId };
	} catch (err) {
		// FINAL ROLLBACK: contact + account
		if (createdContactId) {
			await acClient.delete(`/contact/${createdContactId}`).catch(() => { });
		}

		if (createdAccountId) {
			await acClient.delete(`/account/${createdAccountId}`).catch(() => { });
		}

		throw err;
	}
};

exports.uploadLeadAttachments = async (id, files) => {
	if (!files || files.length === 0) {
		const err = new Error("No files uploaded");
		err.statusCode = 400;
		throw err;
	}

	const lead = await prisma.lead.findUnique({ where: { id } });
	if (!lead) {
		const err = new Error("Lead not found");
		err.statusCode = 404;
		throw err;
	}

	const attachments = [];

	for (const file of files) {
		const fileUrl = await uploadToS3(file);

		const saved = await prisma.leadAttachment.create({
			data: {
				leadId: id, // ✅ THIS IS THE FIX
				fileUrl,
				fileName: file.originalname,
				mimeType: file.mimetype,
				fileSize: file.size,
			},
		});

		attachments.push(saved);
	}

	return attachments;
};

exports.getAllLeads = async () => {
	return await prisma.lead.findMany({
		orderBy: {
			createdAt: "desc",
		},
	});
};

exports.getAllLeadsPaginated = async (params) => {
	const {
		page = 1,
		limit = 10,
		search = "",
		leadStatus = "",
		company = "",
		email = "",
		createdAt = "",
		viewType = "",
		leadOwnerId = "",

		col_leadId,
		col_name,
		col_leadStatus,
		col_company,
		col_email,
		col_leadOwner,
		col_createdAt,

		sortKey = "createdAt",
		sortDirection = "desc",
	} = params;

	// -------------------------------
	// 1) Build Prisma WHERE
	// -------------------------------
	const where = {};

	if (leadStatus) where.leadStatus = leadStatus;
	if (company) where.company = company;
	if (email) where.email = email;
	if (leadOwnerId) where.leadOwnerId = leadOwnerId;

	if (createdAt) {
		where.createdAt = {
			gte: new Date(`${createdAt}T00:00:00Z`),
			lte: new Date(`${createdAt}T23:59:59Z`),
		};
	}

	// View Filters
	if (viewType === "ALL" && leadOwnerId) where.leadOwnerId = leadOwnerId;
	if (viewType === "OPEN") where.leadStatus = "OPEN";
	if (viewType === "CONVERTED") where.leadStatus = "CONVERTED";
	if (viewType === "LOST") where.leadStatus = "LOST";

	// -------------------------------
	// 2) Query Sales Quotes (DB only)
	// -------------------------------
	const rawLeads = await prisma.lead.findMany({ where });

	// -------------------------------
	// 3) Fetch Accounts + Contacts (your existing way)
	// -------------------------------
	const usersRes = await axios.get(`${process.env.USER_MANAGEMENT_URL}/users/s-info`);
	const users = usersRes.data;

	// -------------------------------
	// 4) Convert arrays → lookup maps
	// -------------------------------
	const userMap = new Map();
	users.forEach(u => userMap.set(u.id, u));

	// -------------------------------
	// 5) Enrich Leads
	// -------------------------------
	const enrichedLeads = rawLeads.map((l) => {
		const data = /** @type {any} */ (l);

		const owner = userMap.get(data.leadOwnerId) || null;

		return {
			...data,
			leadOwner: owner ? {
				id: owner.id,
				firstName: owner.firstName,
				lastName: owner.lastName,
			} : null,
			fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
		};
	});

	if (sortKey) {
		enrichedLeads.sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;

			const getValue = (obj, key) => {
				switch (key) {
					case "leadOwner":
						return obj.leadOwner
							? `${obj.leadOwner.firstName} ${obj.leadOwner.lastName}`.toLowerCase()
							: "";
					default:
						return obj[key];
				}
			};

			const A = getValue(a, sortKey);
			const B = getValue(b, sortKey);

			// number sorting
			if (typeof A === "number" && typeof B === "number")
				return (A - B) * dir;

			// date sorting
			if (A instanceof Date && B instanceof Date)
				return (A.getTime() - B.getTime()) * dir;

			// string sorting
			return A.toString().localeCompare(B.toString()) * dir;
		});
	}

	// -------------------------------
	// 6) Column-level filtering
	// -------------------------------
	let filtered = enrichedLeads;

	// 🔍 Global search across all fields
	if (search) {
		const s = search.toLowerCase();

		filtered = filtered.filter((l) => {
			const ownerName = l.leadOwner
				? `${l.leadOwner.firstName} ${l.leadOwner.lastName}`.toLowerCase()
				: "";
			const statusName = l.leadStatus ? l.leadStatus.toLowerCase() : "";

			return (
				l.leadId.toLowerCase().includes(s) ||
				l.name.toLowerCase().includes(s) ||
				statusName.includes(s) ||
				ownerName.includes(s)
			);
		});
	}

	if (col_leadId)
		filtered = filtered.filter((l) =>
			l.leadId.toLowerCase().includes(col_leadId.toLowerCase())
		);

	if (col_name)
		filtered = filtered.filter((l) =>
			l.fullName.toLowerCase().includes(col_name.toLowerCase())
		);

	if (col_leadStatus)
		filtered = filtered.filter((l) =>
			l.leadStatus.toLowerCase().includes(col_leadStatus.toLowerCase())
		);

	if (col_company)
		filtered = filtered.filter((l) =>
			l.company.toLowerCase().includes(col_company.toLowerCase())
		);

	if (col_email)
		filtered = filtered.filter(l =>
			l.email.toLowerCase().includes(col_email.toLowerCase())
		);

	if (col_leadOwner)
		filtered = filtered.filter((l) => {
			const full = `${l.leadOwner.firstName} ${l.leadOwner.lastName}`.toLowerCase();
			return full.includes(col_leadOwner.toLowerCase());
		});

	if (col_createdAt)
		filtered = filtered.filter((l) =>
			new Date(l.createdAt).toISOString().startsWith(col_createdAt)
		);

	// -------------------------------
	// 7) Pagination
	// -------------------------------
	const total = filtered.length;
	const start = (page - 1) * limit;
	const paginated = filtered.slice(start, start + Number(limit));

	const stats = {
		totalLeads: enrichedLeads.length,
		open: enrichedLeads.filter(x => x.leadStatus === "OPEN").length,
		converted: enrichedLeads.filter(x => x.leadStatus === "CONVERTED").length,
		lost: enrichedLeads.filter(x => x.leadStatus === "LOST").length,
	};

	return {
		items: paginated,
		total,
		page: Number(page),
		limit: Number(limit),
		totalPages: Math.ceil(total / limit),
		stats,
	};
};

exports.getLeadById = async (id) => {
	return await prisma.lead.findUnique({
		where: { id },
		include: {
			leadAttachments: true,  // 👈 FIX
		},
	});
};

exports.getNextLeadId = async () => {
	const all = await prisma.lead.findMany({
		select: { leadId: true },
	});

	if (all.length === 0) return "L000001";
	let maxNum = -1;
	let maxId = null;

	for (const row of all) {
		const num = extractNumericSuffix(row.leadId);
		if (num !== null && num > maxNum) {
			maxNum = num;
			maxId = row.leadId;
		}
	}

	if (!maxId) return "L000001";
	return computeNextLeadId(maxId);
};

exports.updateLead = async (id, data) => {
	const normalizedData = normalizeEmptyStrings(data);
	return await prisma.lead.update({ where: { id }, data: normalizedData, });
};

exports.deleteLead = async (id) => {
	try {
		await this.getLeadById(id); // Check if lead exists

		const deletedLead = await prisma.lead.delete({
			where: { id },
		});
		return deletedLead;
	} catch (error) {
		throw error;
	}
}

exports.deleteLeadAttachment = async (leadId, attachmentId) => {
	const attachment = await prisma.leadAttachment.findUnique({
		where: { id: attachmentId },
	});

	if (!attachment) {
		const err = new Error("Attachment not found");
		err.statusCode = 404;
		throw err;
	}

	// Ensure file belongs to this lead
	if (attachment.leadId !== leadId) {
		const err = new Error("Attachment does not belong to this lead");
		err.statusCode = 400;
		throw err;
	}

	// 1️⃣ Delete file from S3 bucket
	await deleteFromS3(attachment.fileUrl);

	// 2️⃣ Delete DB record
	await prisma.leadAttachment.delete({
		where: { id: attachmentId },
	});

	return true;
};
