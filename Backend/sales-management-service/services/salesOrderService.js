const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadToS3, deleteFromS3 } = require("../utils/s3");
const axios = require("axios");

// Helper functions
function extractNumericSuffix(orderId) {
	if (!orderId || typeof orderId !== "string") return null;
	const m = orderId.match(/(\d+)\s*$/);
	return m ? parseInt(m[1], 10) : null;
};

function computeNextOrderId(id) {
	const match = id.match(/^([A-Za-z]+)(\d+)$/);

	if (!match) return "SO000001"; // defensive

	const prefix = match[1];
	const num = match[2];
	const next = (parseInt(num, 10) + 1).toString().padStart(num.length, "0");

	return `${prefix}${next}`;
};

exports.createSalesOrderWithItems = async (orderData, items) => {
	return await prisma.$transaction(async (tx) => {

		// 1️⃣ Create parent Sales Quote
		const order = await tx.salesOrder.create({
			data: orderData
		});

		// 2️⃣ Prepare children insertions
		const itemsToCreate = items.map(item => ({
			orderId: order.orderId,
			productId: item.productId,
			productName: item.productName,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			discount: item.discount,
			tax: item.tax,
			totalPrice: item.totalPrice
		}));

		// 3️⃣ Insert all child items
		await tx.salesOrderItem.createMany({
			data: itemsToCreate
		});

		// 4️⃣ Return the final created object
		return {
			order,
			items: itemsToCreate
		};
	});
};

exports.uploadSalesOrderAttachments = async (id, files) => {
	if (!files || files.length === 0) {
		const err = new Error("No files uploaded");
		err.statusCode = 400;
		throw err;
	}

	const salesOrder = await prisma.salesOrder.findUnique({ where: { id } });
	if (!salesOrder) {
		const err = new Error("Sales Order not found");
		err.statusCode = 404;
		throw err;
	}

	const attachments = [];

	for (const file of files) {
		const fileUrl = await uploadToS3(file, "sales-orders");

		const saved = await prisma.salesOrderAttachment.create({
			data: {
				salesOrderId: id, // ✅ THIS IS THE FIX
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

exports.addSalesOrderNote = async (id, text, author) => {
	return prisma.salesOrderNote.create({
		data: {
			salesOrderId: id,
			text,
			author,
		},
	});
};

exports.getAllSalesOrders = async () => {
	return await prisma.salesOrder.findMany({
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
					orderId: true,
					totalPrice: true,
				},
			},
		},
	});
};

exports.getAllSalesOrdersPaginated = async (params) => {
	const {
		page = 1,
		limit = 10,
		search = "",
		status = "",
		opportunityId = "",
		accountId = "",
		primaryContactId = "",
		totalPrice = "",
		orderOwner = "",
		createdAt = "",
		viewType = "",
		orderOwnerId = "",

		col_orderId,
		col_name,
		col_status,
		col_opportunity,
		col_accountName,
		col_contactName,
		col_totalPrice,
		col_orderOwner,
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
	if (orderOwner) where.orderOwnerId = orderOwner;

	if (totalPrice && !isNaN(totalPrice)) {
		where.totalPrice = Number(totalPrice);
	}

	if (createdAt) {
		where.createdAt = {
			gte: new Date(`${createdAt}T00:00:00Z`),
			lte: new Date(`${createdAt}T23:59:59Z`),
		};
	}

	// View Filters
	if (viewType === "MINE" && orderOwnerId) where.orderOwnerId = orderOwnerId;
	if (viewType === "PENDING") where.status = "PENDING";
	if (viewType === "DELIVERED") where.status = "DELIVERED";

	// -------------------------------
	// 2) Query Sales Quotes (DB only)
	// -------------------------------
	const rawOrders = await prisma.salesOrder.findMany({
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
	const enrichedOrders = rawOrders.map((o) => {
		const data = /** @type {any} */ (o);

		const owner = userMap.get(data.orderOwnerId) || null;

		return {
			...data,
			opportunity: data.opportunity || null,
			orderOwner: owner ? {
				id: owner.id,
				firstName: owner.firstName,
				lastName: owner.lastName,
			} : null,
			account: accountMap.get(data.accountId) || null,
			contact: contactMap.get(String(data.primaryContactId)) || null,
			totalPrice: o.items.reduce((sum, item) =>
				sum + (Number(item.totalPrice) || 0), 0),
		};
	});

	if (sortKey) {
		enrichedOrders.sort((a, b) => {
			const dir = sortDirection === "asc" ? 1 : -1;

			const getValue = (obj, key) => {
				switch (key) {
					case "accountName":
						return obj.account?.name?.toLowerCase() || "";
					case "contactName":
						return obj.contact
							? `${obj.contact.firstName} ${obj.contact.lastName}`.toLowerCase()
							: "";
					case "orderOwner":
						return obj.orderOwner
							? `${obj.orderOwner.firstName} ${obj.orderOwner.lastName}`.toLowerCase()
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
	let filtered = enrichedOrders;

	// 🔍 Global search across all fields
	if (search) {
		const s = search.toLowerCase();
		const sLower = s.toLowerCase();
		const sNum = Number(s);

		filtered = filtered.filter((o) => {
			const opportunityName = o.opportunity?.name?.toLowerCase() || "";
			const accountName = o.account?.name?.toLowerCase() || "";
			const contactName = o.contact
				? `${o.contact.firstName} ${o.contact.lastName}`.toLowerCase()
				: "";
			const ownerName = o.orderOwner
				? `${o.orderOwner.firstName} ${o.orderOwner.lastName}`.toLowerCase()
				: "";
			const statusName = o.status ? o.status.toLowerCase() : "";
			const matchesTotalPrice =
				(!isNaN(sNum) && o.totalPrice === sNum) ||
				String(o.totalPrice || "").includes(sLower);

			return (
				o.orderId.toLowerCase().includes(s) ||
				o.name.toLowerCase().includes(s) ||
				statusName.includes(s) ||
				opportunityName.includes(s) ||
				accountName.includes(s) ||
				contactName.includes(s) ||
				matchesTotalPrice ||
				ownerName.includes(s)
			);
		});
	}

	if (col_orderId)
		filtered = filtered.filter((o) =>
			o.orderId.toLowerCase().includes(col_orderId.toLowerCase())
		);

	if (col_name)
		filtered = filtered.filter((o) =>
			o.name.toLowerCase().includes(col_name.toLowerCase())
		);

	if (col_status)
		filtered = filtered.filter((o) =>
			o.status.toLowerCase().includes(col_status.toLowerCase())
		);

	if (col_opportunity)
		filtered = filtered.filter((o) =>
			o.opportunity?.name
				?.toLowerCase()
				.includes(col_opportunity.toLowerCase())
		);

	if (col_accountName)
		filtered = filtered.filter((o) =>
			o.account?.name
				?.toLowerCase()
				.includes(col_accountName.toLowerCase())
		);

	if (col_contactName)
		filtered = filtered.filter((o) => {
			const full = o.contact
				? `${o.contact.firstName} ${o.contact.lastName}`.toLowerCase()
				: "";
			return full.includes(col_contactName.toLowerCase());
		});

	if (col_totalPrice)
		filtered = filtered.filter(
			(o) =>
				o.totalPrice === Number(col_totalPrice) ||
				String(o.totalPrice).includes(col_totalPrice)
		);

	if (col_orderOwner)
		filtered = filtered.filter((o) => {
			const full = `${o.orderOwner.firstName} ${o.orderOwner.lastName}`.toLowerCase();
			return full.includes(col_orderOwner.toLowerCase());
		});

	if (col_createdAt)
		filtered = filtered.filter((o) =>
			new Date(o.createdAt).toISOString().startsWith(col_createdAt)
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

exports.getSalesOrderById = async (id) => {
	return await prisma.salesOrder.findUnique({
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
					orderId: true,
					totalPrice: true,
					productId: true,
					quantity: true,
					unitPrice: true,
					discount: true,
					tax: true,
				},
			},
			salesOrderAttachments: true,
		},
	});
};

exports.getNextOrderId = async () => {
	const all = await prisma.salesOrder.findMany({
		select: { orderId: true },
	});

	if (all.length === 0) return "SO000001";

	let maxNum = -1;
	let maxId = null;

	for (const row of all) {
		const num = extractNumericSuffix(row.orderId);
		if (num !== null && num > maxNum) {
			maxNum = num;
			maxId = row.orderId;
		}
	}

	if (!maxId) return "SO000001";

	return computeNextOrderId(maxId);
};

exports.updateSalesOrder = async (id, orderData, items) => {
	return await prisma.$transaction(async (tx) => {

		// 1️⃣ Update parent sales order
		const order = await tx.salesOrder.update({
			where: { id },
			data: orderData
		});

		// 2️⃣ Remove all previous items for this order
		await tx.salesOrderItem.deleteMany({
			where: { orderId: order.orderId }
		});

		// 3️⃣ Insert new items fresh
		const itemsToCreate = items.map((item) => ({
			orderId: order.orderId,
			productId: item.productId,
			productName: item.productName,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			discount: item.discount,
			tax: item.tax,
			totalPrice: item.totalPrice
		}));

		await tx.salesOrderItem.createMany({
			data: itemsToCreate
		});

		// 4️⃣ Return updated data
		return {
			order,
			items: itemsToCreate
		};
	});
};

exports.deleteSalesOrder = async (id) => {
	return await prisma.salesOrder.delete({ where: { id } });
};

exports.deleteSalesOrderAttachment = async (soId, attachmentId) => {
	const attachment = await prisma.salesOrderAttachment.findUnique({
		where: { id: attachmentId },
	});

	if (!attachment) {
		const err = new Error("Attachment not found");
		err.statusCode = 404;
		throw err;
	}

	// Ensure file belongs to this lead
	if (attachment.salesOrderId !== soId) {
		const err = new Error("Attachment does not belong to this sales order");
		err.statusCode = 400;
		throw err;
	}

	// 1️⃣ Delete file from S3 bucket
	await deleteFromS3(attachment.fileUrl);

	// 2️⃣ Delete DB record
	await prisma.salesOrderAttachment.delete({
		where: { id: attachmentId },
	});

	return true;
};

exports.deleteSalesOrderNote = async (noteId) => {
	return prisma.salesOrderNote.delete({
		where: { id: noteId },
	});
};
