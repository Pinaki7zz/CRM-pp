const salesOrderService = require("../services/salesOrderService");
const axios = require("axios");

exports.createSalesOrder = async (req, res) => {
	try {
		const { orderData, items } = req.body;
		const result = await salesOrderService.createSalesOrderWithItems(
			orderData,
			items
		);
		res.status(201).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.uploadSalesOrderAttachments = async (req, res) => {
	try {
		const attachments = await salesOrderService.uploadSalesOrderAttachments(
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

exports.addSalesOrderNote = async (req, res) => {
	try {
		const { id } = req.params;
		const { text, author } = req.body;
		if (!text || !text.trim()) {
			return res.status(400).json({ message: "Note text is required" });
		}
		const note = await salesOrderService.addSalesOrderNote(id, text, author);
		return res.status(201).json(note);
	} catch (err) {
		console.error("Error saving note", err);
		return res.status(500).json({ message: "Failed to save note" });
	}
};

exports.getAllSalesOrders = async (req, res) => {
	try {
		const salesOrders = await salesOrderService.getAllSalesOrders();
		res.status(200).json(salesOrders);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllSalesOrdersPaginated = async (req, res) => {
	try {
		const result = await salesOrderService.getAllSalesOrdersPaginated({
			...req.query
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getSalesOrdersExportedInCsv = async (req, res) => {
	try {
		const salesOrders = await salesOrderService.getAllSalesOrders();

		if (!salesOrders || salesOrders.length === 0) {
			return res.status(200).send("No sales orders found");
		}

		// 🔹 Fetch Accounts
		const accountsRes = await axios.get(
			`${process.env.ACCOUNTS_CONTACTS_URL}/account`
		);
		const accounts = accountsRes.data;

		// 🔹 Fetch Contacts
		const contactsRes = await axios.get(
			`${process.env.ACCOUNTS_CONTACTS_URL}/contact`
		);
		const contacts = contactsRes.data;

		// 🔹 Fetch Users (Order Owners)
		const usersRes = await axios.get(
			`${process.env.USER_MANAGEMENT_URL}/users/s-info`
		);
		const users = usersRes.data;

		// 🔹 Build lookup maps
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

		// 🔹 CSV Header
		let csv =
			"Order ID,Order Name,Status,Account Name,Contact Name,Opportunity Name,Owner Name,Grand Total,Created At\n";

		// 🔹 CSV Rows
		csv += salesOrders
			.map(order => {
				const accountName = accountMap[order.accountId] || "--";
				const contactName = contactMap[order.primaryContactId] || "--";
				const oppName = order.opportunity?.name || "--";
				const ownerName = ownerMap[order.orderOwnerId] || "--";

				const grandTotal = order.items
					? order.items.reduce(
						(sum, item) => sum + Number(item.totalPrice || 0),
						0
					)
					: 0;

				return [
					order.orderId,
					order.name,
					order.status,
					accountName,
					contactName,
					oppName,
					ownerName,
					grandTotal.toFixed(2),
					order.createdAt,
				].join(",");
			})
			.join("\n");

		// 🔹 Response headers
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=sales-orders.csv"
		);

		return res.status(200).send(csv);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to export CSV" });
	}
};

exports.getSalesOrderById = async (req, res) => {
	try {
		const salesOrder = await salesOrderService.getSalesOrderById(req.params.id);
		if (!salesOrder) return res.status(404).json({ message: "SalesOrder not found" });
		res.status(200).json(salesOrder);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getNextOrderId = async (req, res) => {
	try {
		const orderId = await salesOrderService.getNextOrderId();
		res.status(200).json({ orderId });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
}

exports.updateSalesOrder = async (req, res) => {
	try {
		const { orderData, items } = req.body;
		const result = await salesOrderService.updateSalesOrder(
			req.params.id,
			orderData,
			items
		);
		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteSalesOrder = async (req, res) => {
	try {
		await salesOrderService.deleteSalesOrder(req.params.id);
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteSalesOrderAttachment = async (req, res) => {
	try {
		const { soId, attachmentId } = req.params;
		await salesOrderService.deleteSalesOrderAttachment(soId, attachmentId);
		return res.status(204).json({ message: "Attachment deleted" });
	} catch (err) {
		console.error(err);
		return res.status(err.statusCode || 500).json({
			message: err.message || "Failed to delete attachment",
		});
	}
};

exports.deleteSalesOrderNote = async (req, res) => {
	try {
		const { noteId } = req.params;
		await salesOrderService.deleteSalesOrderNote(noteId);
		return res.json({ message: "Note deleted" });
	} catch (err) {
		console.error("Error deleting note", err);
		return res.status(500).json({ message: "Failed to delete note" });
	}
};
