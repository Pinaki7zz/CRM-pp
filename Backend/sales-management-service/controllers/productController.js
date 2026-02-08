const productService = require("../services/productService");

const parseDate = (dateStr) => {
	if (!dateStr) return null;
	const d = new Date(dateStr);
	return isNaN(d.getTime()) ? null : d.toISOString();
};

exports.createProduct = async (req, res) => {
	try {
		const productInfo = {
			...req.body,
			// Fix: Access properties from req.body and parse safely
			salesStartDate: parseDate(req.body.salesStartDate),
			salesEndDate: parseDate(req.body.salesEndDate),
			supportStartDate: parseDate(req.body.supportStartDate),
			supportEndDate: parseDate(req.body.supportEndDate),
			
			// Safe number parsing
			unitPrice: parseFloat(req.body.unitPrice) || 0.0,
			commissionRate: parseFloat(req.body.commissionRate) || 0.0,
			tax: parseFloat(req.body.tax) || 0.0,
			quantityOrdered: parseInt(req.body.quantityOrdered, 10) || 0,
			quantityInStock: parseInt(req.body.quantityInStock, 10) || 0,
			reorderLevel: parseInt(req.body.reorderLevel, 10) || 0,
			quantityInDemand: parseInt(req.body.quantityInDemand, 10) || 0,
			
			// Ensure booleans
			taxable: req.body.taxable === true || req.body.taxable === 'true',
			isActiveStock: req.body.isActiveStock === true || req.body.isActiveStock === 'true',

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		// Basic validation for Enums to prevent 500s from Prisma
		if (!productInfo.unitOfMeasurement) {
			return res.status(400).json({ message: "Unit of Measurement is required." });
		}
		if (!productInfo.usageUnit) {
			return res.status(400).json({ message: "Usage Unit is required." });
		}

		const product = await productService.createProduct(productInfo);
		res.status(201).json(product);
	} catch (err) {
		console.error("Create Product Error:", err);
		res.status(500).json({ message: err.message || "Internal Server Error" });
	}
};

exports.getAllProducts = async (req, res) => {
	try {
		const products = await productService.getAllProducts();
		res.status(200).json(products);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllProductsPaginated = async (req, res) => {
	try {
		const {
			page,
			limit,
			search,
			status,
			productCategoryId,
			createdAt,
			viewType,
			productOwnerId
		} = req.query;

		const result = await productService.getAllProductsPaginated({
			page,
			limit,
			search,
			status,
			productCategoryId,
			createdAt,
			viewType,
			productOwnerId
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getProductById = async (req, res) => {
	try {
		const product = await productService.getProductById(req.params.id);
		if (!product) return res.status(404).json({ message: "Product not found" });
		res.status(200).json(product);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.updateProduct = async (req, res) => {
	try {
		const productInfo = {
			...req.body,
			salesStartDate: parseDate(req.body.salesStartDate),
			salesEndDate: parseDate(req.body.salesEndDate),
			supportStartDate: parseDate(req.body.supportStartDate),
			supportEndDate: parseDate(req.body.supportEndDate),
			updatedAt: new Date().toISOString(),
		}
		const product = await productService.updateProduct(req.params.id, productInfo);
		res.status(200).json(product);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteProduct = async (req, res) => {
	try {
		const result = await productService.deleteProduct(req.params.id);
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

// --- Attachment Controllers ---

exports.addAttachment = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const productId = req.params.id;
		
		// Pass file info to service
		const attachment = await productService.addAttachment(productId, req.file);

		// Return format matching Frontend expectations
		res.status(201).json({
			id: attachment.id,
			fileName: attachment.fileName,
			size: attachment.fileSize,
			date: attachment.createdAt,
			url: attachment.filePath // Or a generated URL if serving static files
		});
	} catch (err) {
		console.error("Add Attachment Error:", err);
		res.status(500).json({ message: "Failed to upload attachment" });
	}
};

exports.getAttachments = async (req, res) => {
	try {
		const productId = req.params.id;
		const attachments = await productService.getAttachments(productId);
		
		// Map to frontend friendly format
		const formatted = attachments.map(att => ({
			id: att.id,
			fileName: att.fileName,
			size: att.fileSize,
			date: att.createdAt,
			url: att.filePath
		}));

		res.status(200).json(formatted);
	} catch (err) {
		console.error("Get Attachments Error:", err);
		res.status(500).json({ message: "Failed to fetch attachments" });
	}
};