const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const salesOrderService = require("./salesOrderService");
const { uploadToS3, deleteFromS3 } = require("../utils/s3");
const html_to_pdf = require("html-pdf-node");
const axios = require("axios");
const template = require("../templates/salesQuotePdfTemplate");

// Helper functions
function extractNumericSuffix(quoteId) {
	if (!quoteId || typeof quoteId !== "string") return null;
	const m = quoteId.match(/(\d+)\s*$/);
	return m ? parseInt(m[1], 10) : null;
}

function computeNextQuoteId(id) {
	const match = id.match(/^([A-Za-z]+)(\d+)$/);

	if (!match) return "SQ000001"; // defensive

	const prefix = match[1];
	const num = match[2];
	const next = (parseInt(num, 10) + 1).toString().padStart(num.length, "0");

	return `${prefix}${next}`;
}

const normalizeEmptyStrings = (obj) => {
	const normalized = {};

	for (const [key, value] of Object.entries(obj)) {

		// 🚀 Special rule for status
		if (key === "status") {
			// empty string, null, undefined → "OPEN"
			if (!value) {
				normalized[key] = "OPEN";
			} else {
				normalized[key] = value;
			}
			continue;
		}

		// general rule: convert "" → null
		if (value === "") {
			normalized[key] = null;
		} else {
			normalized[key] = value;
		}
	}

	return normalized;
};

exports.createSalesQuote = async (quoteData, items) => {
	return await prisma.$transaction(async (tx) => {

		// ✅ 1️⃣ Normalize parent
		const normalizedQuoteData = normalizeEmptyStrings(quoteData);

		// 2️⃣ Create parent Sales Quote
		const quote = await tx.salesQuote.create({
			data: normalizedQuoteData
		});

		// ✅ 3️⃣ Normalize each item
		const itemsToCreate = items.map((item) =>
			normalizeEmptyStrings({
				quoteId: quote.quoteId,
				productId: item.productId,
				productName: item.productName,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discount: item.discount,
				tax: item.tax,
				totalPrice: item.totalPrice
			})
		);

		// 4️⃣ Insert all child items
		await tx.salesQuoteItem.createMany({
			data: itemsToCreate
		});

		return {
			quote,
			items: itemsToCreate
		};
	});
};

exports.convertSalesQuote = async (id) => {
	return await prisma.$transaction(async (tx) => {

		// 1️⃣ Fetch quote with items
		const quote = await tx.salesQuote.findUnique({
			where: { id },
			include: { items: true },
		});

		if (!quote) {
			const err = new Error("Sales Quote not found");
			err.statusCode = 404;
			throw err;
		}

		// (Optional but recommended)
		if (quote.status === "ACCEPTED") {
			const err = new Error("Sales Quote already accepted");
			err.statusCode = 400;
			throw err;
		}

		// 2️⃣ Generate next Sales Order ID
		const orderId = await salesOrderService.getNextOrderId();

		// 3️⃣ Create Sales Order (parent)
		const order = await tx.salesOrder.create({
			data: {
				orderId,
				name: quote.name,
				orderOwnerId: quote.quoteOwnerId,

				opportunityId: quote.opportunityId,
				accountId: quote.accountId,
				primaryContactId: quote.primaryContactId,

				subject: quote.subject,
				amount: quote.amount,
				dueDate: quote.dueDate,
				status: "PENDING",

				billingStreet: quote.billingStreet,
				billingCity: quote.billingCity,
				billingState: quote.billingState,
				billingCountry: quote.billingCountry,
				billingPostalCode: quote.billingPostalCode,

				shippingStreet: quote.shippingStreet,
				shippingCity: quote.shippingCity,
				shippingState: quote.shippingState,
				shippingCountry: quote.shippingCountry,
				shippingPostalCode: quote.shippingPostalCode,

				description: quote.description,
				notes: quote.notes,
			},
		});

		// 4️⃣ Convert items
		const orderItems = quote.items.map((item) => ({
			orderId: order.orderId,
			productId: item.productId,
			productName: item.productName,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			discount: item.discount,
			tax: item.tax,
			totalPrice: item.totalPrice,
		}));

		await tx.salesOrderItem.createMany({
			data: orderItems,
		});

		// 5️⃣ Update quote status (optional but recommended)
		await tx.salesQuote.update({
			where: { id },
			data: { status: "ACCEPTED" },
		});

		return {
			orderId: order.orderId,
			order,
			items: orderItems,
		};
	});
};

exports.uploadSalesQuoteAttachments = async (id, files) => {
	if (!files || files.length === 0) {
		const err = new Error("No files uploaded");
		err.statusCode = 400;
		throw err;
	}

	const salesQuote = await prisma.salesQuote.findUnique({ where: { id } });
	if (!salesQuote) {
		const err = new Error("Sales Quote not found");
		err.statusCode = 404;
		throw err;
	}

	const attachments = [];

	for (const file of files) {
		const fileUrl = await uploadToS3(file, "sales-quotes");

		const saved = await prisma.salesQuoteAttachment.create({
			data: {
				salesQuoteId: id, // ✅ THIS IS THE FIX
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

exports.addSalesQuoteNote = async (id, text, author) => {
	return prisma.salesQuoteNote.create({
		data: {
			salesQuoteId: id,
			text,
			author,
		},
	});
};

exports.getAllSalesQuotes = async () => {
	return await prisma.salesQuote.findMany({
		include: {
			opportunity: {
				select: {
					id: true,
					name: true,
				},
			},
			items: {
				select: {
					id: true,
					quoteId: true,
					totalPrice: true,
				},
			},
		},
	});
};

exports.getAllSalesQuotesPaginated = async (params) => {
	const {
		page = 1,
		limit = 10,
		search = "",
		status = "",
		opportunityId = "",
		accountId = "",
		primaryContactId = "",
		totalPrice = "",
		successRate = "",
		quoteOwner = "",
		createdAt = "",
		viewType = "",
		quoteOwnerId = "",

		col_quoteId,
		col_name,
		col_status,
		col_opportunity,
		col_accountName,
		col_contactName,
		col_totalPrice,
		col_successRate,
		col_quoteOwner,
		col_createdAt,

		sortKey = "createdAt",
		sortDirection = "desc",
	} = params;

	// -------------------------------
	// 1) Build Prisma WHERE
	// -------------------------------
	const where = {};

	if (status) where.status = status;
	if (opportunityId) where.opportunityId = opportunityId;
	if (accountId) where.accountId = accountId;
	if (primaryContactId) where.primaryContactId = primaryContactId;
	if (quoteOwner) where.quoteOwnerId = quoteOwner;

	if (totalPrice && !isNaN(totalPrice)) {
		where.totalPrice = Number(totalPrice);
	}

	if (successRate && !isNaN(successRate)) {
		where.successRate = Number(successRate);
	}

	if (createdAt) {
		where.createdAt = {
			gte: new Date(`${createdAt}T00:00:00Z`),
			lte: new Date(`${createdAt}T23:59:59Z`),
		};
	}

	// View Filters
	if (viewType === "MINE" && quoteOwnerId) where.quoteOwnerId = quoteOwnerId;
	if (viewType === "DRAFT") where.status = "DRAFT";
	if (viewType === "ACCEPTED") where.status = "ACCEPTED";
	if (viewType === "REJECTED") where.status = "REJECTED";

	// -------------------------------
	// 2) Query Sales Quotes (DB only)
	// -------------------------------
	const rawQuotes = await prisma.salesQuote.findMany({
		where,
		include: {
			opportunity: true,
			items: true,
		},
	});

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
	// 5) Enrich Quotes
	// -------------------------------
	const enrichedQuotes = rawQuotes.map((q) => {
		const data = /** @type {any} */ (q);

		const owner = userMap.get(data.quoteOwnerId) || null;

		return {
			...data,
			opportunity: data.opportunity || null,
			quoteOwner: owner ? {
				id: owner.id,
				firstName: owner.firstName,
				lastName: owner.lastName,
			} : null,
			account: accountMap.get(data.accountId) || null,
			contact: contactMap.get(String(data.primaryContactId)) || null,
			totalPrice: q.items.reduce((sum, item) =>
				sum + (Number(item.totalPrice) || 0), 0),
		};
	});

	if (sortKey) {
		enrichedQuotes.sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;

			const getValue = (obj, key) => {
				switch (key) {
					case "accountName":
						return obj.account?.name?.toLowerCase() || "";
					case "contactName":
						return obj.contact
							? `${obj.contact.firstName} ${obj.contact.lastName}`.toLowerCase()
							: "";
					case "quoteOwner":
						return obj.quoteOwner
							? `${obj.quoteOwner.firstName} ${obj.quoteOwner.lastName}`.toLowerCase()
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
	let filtered = enrichedQuotes;

	// 🔍 Global search across all fields
	if (search) {
		const s = search.toLowerCase();
		const sLower = s.toLowerCase();
		const sNum = Number(s);

		filtered = filtered.filter((q) => {
			const opportunityName = q.opportunity?.name?.toLowerCase() || "";
			const accountName = q.account?.name?.toLowerCase() || "";
			const contactName = q.contact
				? `${q.contact.firstName} ${q.contact.lastName}`.toLowerCase()
				: "";
			const ownerName = q.quoteOwner
				? `${q.quoteOwner.firstName} ${q.quoteOwner.lastName}`.toLowerCase()
				: "";
			const statusName = q.status ? q.status.toLowerCase() : "";
			const matchesTotalPrice =
				(!isNaN(sNum) && q.totalPrice === sNum) ||
				String(q.totalPrice || "").includes(sLower);
			const matchesSuccessRate =
				(!isNaN(sNum) && q.successRate === sNum) ||
				String(q.successRate || "").includes(sLower);

			return (
				q.quoteId.toLowerCase().includes(s) ||
				q.name.toLowerCase().includes(s) ||
				statusName.includes(s) ||
				opportunityName.includes(s) ||
				accountName.includes(s) ||
				contactName.includes(s) ||
				matchesTotalPrice ||
				matchesSuccessRate ||
				ownerName.includes(s)
			);
		});
	}

	if (col_quoteId)
		filtered = filtered.filter((q) =>
			q.quoteId.toLowerCase().includes(col_quoteId.toLowerCase())
		);

	if (col_name)
		filtered = filtered.filter((q) =>
			q.name.toLowerCase().includes(col_name.toLowerCase())
		);

	if (col_status)
		filtered = filtered.filter((q) =>
			q.status.toLowerCase().includes(col_status.toLowerCase())
		);

	if (col_opportunity)
		filtered = filtered.filter((q) =>
			q.opportunity?.name
				?.toLowerCase()
				.includes(col_opportunity.toLowerCase())
		);

	if (col_accountName)
		filtered = filtered.filter((q) =>
			q.account?.name
				?.toLowerCase()
				.includes(col_accountName.toLowerCase())
		);

	if (col_contactName)
		filtered = filtered.filter((q) => {
			const full = q.contact
				? `${q.contact.firstName} ${q.contact.lastName}`.toLowerCase()
				: "";
			return full.includes(col_contactName.toLowerCase());
		});

	if (col_totalPrice)
		filtered = filtered.filter(
			(q) =>
				q.totalPrice === Number(col_totalPrice) ||
				String(q.totalPrice).includes(col_totalPrice)
		);

	if (col_successRate)
		filtered = filtered.filter(
			(q) =>
				q.successRate === Number(col_successRate) ||
				String(q.successRate).includes(col_successRate)
		);

	if (col_quoteOwner)
		filtered = filtered.filter((q) => {
			const full = `${q.quoteOwner.firstName} ${q.quoteOwner.lastName}`.toLowerCase();
			return full.includes(col_quoteOwner.toLowerCase());
		});

	if (col_createdAt)
		filtered = filtered.filter((q) =>
			new Date(q.createdAt).toISOString().startsWith(col_createdAt)
		);

	// -------------------------------
	// 7) Pagination
	// -------------------------------
	const total = filtered.length;
	const start = (page - 1) * limit;
	const paginated = filtered.slice(start, start + Number(limit));

	return {
		items: paginated,
		total,
		page: Number(page),
		limit: Number(limit),
		totalPages: Math.ceil(total / limit),
	};
};

exports.generateSalesQuotePdf = async (id) => {
	// 1️⃣ Fetch Sales Quote
	const quote = await prisma.salesQuote.findUnique({
		where: { id },
		include: {
			items: { include: { product: true } },
			opportunity: true,
			salesQuoteAttachments: true,
		},
	});

	if (!quote) throw new Error("Sales Quote not found");

	// 2️⃣ FETCH ACCOUNT NAME (via microservice)
	let accountName = "-";
	try {
		if (quote.accountId) {
			const res = await axios.get(
				`${process.env.ACCOUNTS_CONTACTS_URL}/account/${quote.accountId}`
			);
			accountName = res.data?.name || "-";
		}
	} catch (err) {
		console.warn("Account fetch failed:", err.message);
	}

	// 3️⃣ FETCH CONTACT NAME (via microservice)
	let contactName = "-";
	try {
		if (quote.primaryContactId) {
			const res = await axios.get(
				`${process.env.ACCOUNTS_CONTACTS_URL}/contact/${quote.primaryContactId}`
			);
			const contact = res.data;
			contactName = `${contact.firstName} ${contact.lastName}`;
		}
	} catch (err) {
		console.warn("Contact fetch failed:", err.message);
	}

	// 4️⃣ Enrich data
	const enrichedQuote = {
		...quote,
		accountName,
		contactName,
	};

	// 5️⃣ Create HTML
	const html = template(enrichedQuote);

	// 6️⃣ Generate PDF using html-pdf-node (WKHTMLTOPDF MODE)
	const pdfOptions = {
		format: "A4",
		printBackground: true,
		preferCSSPageSize: true,
		margin: { top: "20px", bottom: "20px" },
		browser: false
	};

	const pdfBuffer = await html_to_pdf.generatePdf({ content: html }, pdfOptions);

	return pdfBuffer;
};

exports.getSalesQuoteById = async (id) => {
	return await prisma.salesQuote.findUnique({
		where: { id },
		include: {
			opportunity: {
				select: {
					id: true,
					name: true,
				},
			},
			items: {
				select: {
					id: true,
					quoteId: true,
					totalPrice: true,
					productId: true,
					quantity: true,
					unitPrice: true,
					discount: true,
					tax: true,
				},
			},
			salesQuoteAttachments: true,
		},
	});
};

exports.getNextQuoteId = async () => {
	const all = await prisma.salesQuote.findMany({
		select: { quoteId: true },
	});

	if (all.length === 0) return "SQ000001";

	let maxNum = -1;
	let maxId = null;

	for (const row of all) {
		const num = extractNumericSuffix(row.quoteId);
		if (num !== null && num > maxNum) {
			maxNum = num;
			maxId = row.quoteId;
		}
	}

	if (!maxId) return "SQ000001";

	return computeNextQuoteId(maxId);
};

exports.updateSalesQuote = async (id, quoteData, items) => {
	return await prisma.$transaction(async (tx) => {

		// ✅ 1️⃣ Normalize parent
		const normalizedQuoteData = normalizeEmptyStrings(quoteData);

		// 2️⃣ Update parent
		const quote = await tx.salesQuote.update({
			where: { id },
			data: normalizedQuoteData
		});

		// 3️⃣ Remove old items
		await tx.salesQuoteItem.deleteMany({
			where: { quoteId: quote.quoteId }
		});

		// ✅ 4️⃣ Normalize new items
		const itemsToCreate = items.map((item) =>
			normalizeEmptyStrings({
				quoteId: quote.quoteId,
				productId: item.productId,
				productName: item.productName,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discount: item.discount,
				tax: item.tax,
				totalPrice: item.totalPrice
			})
		);

		await tx.salesQuoteItem.createMany({
			data: itemsToCreate
		});

		return {
			quote,
			items: itemsToCreate
		};
	});
};

exports.deleteSalesQuote = async (id) => {
	return await prisma.salesQuote.delete({ where: { id } });
};

exports.deleteSalesQuoteAttachment = async (sqId, attachmentId) => {
	const attachment = await prisma.salesQuoteAttachment.findUnique({
		where: { id: attachmentId },
	});

	if (!attachment) {
		const err = new Error("Attachment not found");
		err.statusCode = 404;
		throw err;
	}

	// Ensure file belongs to this lead
	if (attachment.salesQuoteId !== sqId) {
		const err = new Error("Attachment does not belong to this sales quote");
		err.statusCode = 400;
		throw err;
	}

	// 1️⃣ Delete file from S3 bucket
	await deleteFromS3(attachment.fileUrl);

	// 2️⃣ Delete DB record
	await prisma.salesQuoteAttachment.delete({
		where: { id: attachmentId },
	});

	return true;
};

exports.deleteSalesQuoteNote = async (noteId) => {
	return prisma.salesQuoteNote.delete({
		where: { id: noteId },
	});
};
