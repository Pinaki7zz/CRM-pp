const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadToS3, deleteFromS3 } = require("../utils/s3");
const axios = require("axios");

const normalizeEmptyStrings = (data) => {
	Object.keys(data).forEach((key) => {
		if (data[key] === "") data[key] = null;
	});
	return data;
};

exports.createOpportunity = async (data) => {
	const normalized = normalizeEmptyStrings(data);
	return prisma.opportunity.create({
		data: normalized,
	});
};

exports.uploadOpportunityAttachments = async (id, files) => {
	if (!files || files.length === 0) {
		const err = new Error("No files uploaded");
		err.statusCode = 400;
		throw err;
	}

	const opportunity = await prisma.opportunity.findUnique({ where: { id } });
	if (!opportunity) {
		const err = new Error("Opportunity not found");
		err.statusCode = 404;
		throw err;
	}

	const attachments = [];

	for (const file of files) {
		const fileUrl = await uploadToS3(file, "opportunities");

		const saved = await prisma.opportunityAttachment.create({
			data: {
				opportunityId: id, // ✅ THIS IS THE FIX
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

exports.addOpportunityNote = async (id, text, author) => {
	return prisma.opportunityNote.create({
		data: {
			opportunityId: id,
			text,
			author,
		},
	});
};

exports.getAllOpportunities = async () => {
	return await prisma.opportunity.findMany();
};

exports.getAllOpportunitiesPaginated = async (params) => {
	const {
		page = 1,
		limit = 10,
		search = "",
		accountId = "",
		primaryContactId = "",
		stage = "",
		status = "",
		amount = "",
		probability = "",
		opportunityOwner = "",
		createdAt = "",
		viewType = "",
		opportunityOwnerId = "",

		col_name,
		col_accountName,
		col_contactName,
		col_stage,
		col_status,
		col_amount,
		col_probability,
		col_opportunityOwner,
		col_createdAt,

		sortKey = "createdAt",
		sortDirection = "desc",
	} = params;

	// -------------------------------
	// 1) Build Prisma WHERE
	// -------------------------------
	const where = {};

	if (accountId) where.accountId = accountId;
	if (primaryContactId) where.primaryContactId = primaryContactId;
	if (stage) where.stage = stage;
	if (status) where.status = status;
	if (opportunityOwner) where.opportunityOwnerId = opportunityOwner;

	if (amount && !isNaN(amount)) {
		where.amount = Number(amount);
	}

	if (probability && !isNaN(probability)) {
		where.probability = Number(probability);
	}

	if (createdAt) {
		where.createdAt = {
			gte: new Date(`${createdAt}T00:00:00Z`),
			lte: new Date(`${createdAt}T23:59:59Z`),
		};
	}

	// View Filters
	if (viewType === "MINE" && opportunityOwnerId) where.opportunityOwnerId = opportunityOwnerId;
	if (viewType === "OPEN") where.status = "OPEN";
	if (viewType === "COMPLETED") where.status = "COMPLETED";
	if (viewType === "CANCELLED") where.status = "CANCELLED";

	// -------------------------------
	// 2) Query Sales Quotes (DB only)
	// -------------------------------
	const rawOpportunities = await prisma.opportunity.findMany({ where });

	// -------------------------------
	// 3) Fetch Accounts + Contacts (your existing way)
	// -------------------------------
	const usersRes = await axios.get(`${process.env.USER_MANAGEMENT_URL}/users/s-info`);
	const accountsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/account`);
	const contactsRes = await axios.get(`${process.env.ACCOUNTS_CONTACTS_URL}/contact`);

	const users = usersRes.data;
	const accounts = accountsRes.data;
	const contacts = contactsRes.data;

	// 🔧 IMPORTANT FIX — Attach contacts to their accounts
	accounts.forEach(acc => {
		acc.contacts = contacts.filter(c => c.accountId === acc.accountId);
	});

	// -------------------------------
	// 4) Convert arrays → lookup maps
	// -------------------------------
	const userMap = new Map();
	users.forEach(u => userMap.set(u.id, u));

	const accountMap = new Map();
	accounts.forEach(acc => accountMap.set(acc.accountId, acc));

	const contactMap = new Map();
	contacts.forEach(c => contactMap.set(String(c.contactId), c));

	// -------------------------------
	// 5) Enrich Opportunities
	// -------------------------------
	const enrichedOpportunities = rawOpportunities.map((opp) => {
		const data = /** @type {any} */ (opp);

		const owner = userMap.get(data.opportunityOwnerId) || null;

		return {
			...data,
			opportunityOwner: owner ? {
				id: owner.id,
				firstName: owner.firstName,
				lastName: owner.lastName,
			} : null,
			account: accountMap.get(data.accountId) || null,
			contact: contactMap.get(String(data.primaryContactId)) || null,
		};
	});

	if (sortKey) {
		enrichedOpportunities.sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;

			const getValue = (obj, key) => {
				switch (key) {
					case "accountName":
						return obj.account?.name?.toLowerCase() || "";
					case "contactName":
						return obj.contact
							? `${obj.contact.firstName} ${obj.contact.lastName}`.toLowerCase()
							: "";
					case "opportunityOwner":
						return obj.opportunityOwner
							? `${obj.opportunityOwner.firstName} ${obj.opportunityOwner.lastName}`.toLowerCase()
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
	let filtered = enrichedOpportunities;

	// 🔍 Global search across all fields
	if (search) {
		const s = search.toLowerCase();
		const sLower = s.toLowerCase();
		const sNum = Number(s);

		filtered = filtered.filter((opp) => {
			const accountName = opp.account?.name?.toLowerCase() || "";
			const contactName = opp.contact
				? `${opp.contact.firstName} ${opp.contact.lastName}`.toLowerCase()
				: "";
			const stageName = opp.stage ? opp.stage.toLowerCase() : "";
			const statusName = opp.status ? opp.status.toLowerCase() : "";
			const matchesAmount =
				(!isNaN(sNum) && opp.amount === sNum) ||
				String(opp.amount || "").includes(sLower);
			const matchesProbability =
				(!isNaN(sNum) && opp.probability === sNum) ||
				String(opp.probability || "").includes(sLower);
			const ownerName = opp.opportunityOwner
				? `${opp.opportunityOwner.firstName} ${opp.opportunityOwner.lastName}`.toLowerCase()
				: "";

			return (
				opp.name.toLowerCase().includes(s) ||
				accountName.includes(s) ||
				contactName.includes(s) ||
				stageName.includes(s) ||
				statusName.includes(s) ||
				matchesAmount ||
				matchesProbability ||
				ownerName.includes(s)
			);
		});
	}

	if (col_name)
		filtered = filtered.filter((opp) =>
			opp.name.toLowerCase().includes(col_name.toLowerCase())
		);

	if (col_accountName)
		filtered = filtered.filter((opp) =>
			opp.account?.name
				?.toLowerCase()
				.includes(col_accountName.toLowerCase())
		);

	if (col_contactName)
		filtered = filtered.filter((opp) => {
			const full = opp.contact
				? `${opp.contact.firstName} ${opp.contact.lastName}`.toLowerCase()
				: "";
			return full.includes(col_contactName.toLowerCase());
		});

	if (col_stage)
		filtered = filtered.filter((opp) =>
			opp.stage.toLowerCase().includes(col_stage.toLowerCase())
		);

	if (col_status)
		filtered = filtered.filter((opp) =>
			opp.status.toLowerCase().includes(col_status.toLowerCase())
		);

	if (col_amount)
		filtered = filtered.filter(
			(opp) =>
				opp.amount === Number(col_amount) ||
				String(opp.amount).includes(col_amount)
		);

	if (col_probability)
		filtered = filtered.filter(
			(opp) =>
				opp.probability === Number(col_probability) ||
				String(opp.probability).includes(col_probability)
		);

	if (col_opportunityOwner)
		filtered = filtered.filter((opp) => {
			const full = `${opp.opportunityOwner.firstName} ${opp.opportunityOwner.lastName}`.toLowerCase();
			return full.includes(col_opportunityOwner.toLowerCase());
		});

	if (col_createdAt)
		filtered = filtered.filter((opp) =>
			new Date(opp.createdAt).toISOString().startsWith(col_createdAt)
		);

	// -------------------------------
	// 7) Pagination
	// -------------------------------
	const total = filtered.length;
	const start = (page - 1) * limit;
	const paginated = filtered.slice(start, start + Number(limit))

	return {
		items: paginated,
		total,
		page: Number(page),
		limit: Number(limit),
		totalPages: Math.ceil(total / limit),
	};
};

exports.getAllOpportunityIdsNames = async () => {
	return await prisma.opportunity.findMany({
		select: {
			id: true,
			name: true,
			accountId: true,
			primaryContactId: true,
			amount: true,
		}
	});
};

exports.getOpportunityById = async (id) => {
	return await prisma.opportunity.findUnique({
		where: { id },
		include: {
			opportunityAttachments: true,
			opportunityNotes: {
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});
};

exports.updateOpportunity = async (id, data) => {
	const normalized = normalizeEmptyStrings(data);
	return await prisma.opportunity.update({ where: { id }, data: normalized, });
};

exports.deleteOpportunity = async (id) => {
	return await prisma.opportunity.delete({ where: { id } });
};

exports.deleteOpportunityAttachment = async (oppId, attachmentId) => {
	const attachment = await prisma.opportunityAttachment.findUnique({
		where: { id: attachmentId },
	});

	if (!attachment) {
		const err = new Error("Attachment not found");
		err.statusCode = 404;
		throw err;
	}

	// Ensure file belongs to this lead
	if (attachment.opportunityId !== oppId) {
		const err = new Error("Attachment does not belong to this opportunity");
		err.statusCode = 400;
		throw err;
	}

	// 1️⃣ Delete file from S3 bucket
	await deleteFromS3(attachment.fileUrl);

	// 2️⃣ Delete DB record
	await prisma.opportunityAttachment.delete({
		where: { id: attachmentId },
	});

	return true;
};

exports.deleteOpportunityNote = async (noteId) => {
	return prisma.opportunityNote.delete({
		where: { id: noteId },
	});
};
