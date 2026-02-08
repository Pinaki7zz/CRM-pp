const productCategoryService = require("../services/productCategoryService");

exports.createProductCategoryWithSubs = async (req, res) => {
	try {
		const { parent, subCategories } = req.body;

		const payloadParent = {
			...parent,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const payloadSubs = (subCategories || []).map((sub) => ({
			...sub,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}));

		const result = await productCategoryService.createProductCategoryWithSubs(
			payloadParent,
			payloadSubs
		);

		res.status(201).json(result);
	} catch (err) {
		console.error("Transaction Error:", err);
		res.status(500).json({ message: err.message });
	}
};


exports.getAllProductCategories = async (req, res) => {
	try {
		const productCategories = await productCategoryService.getAllProductCategories();
		res.status(200).json(productCategories);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getAllProductCategoriesPaginated = async (req, res) => {
	try {
		const { page, limit, search, status, createdAt, viewType } = req.query;

		const result = await productCategoryService.getAllProductCategoriesPaginated({
			page,
			limit,
			search,
			status,
			createdAt,
			viewType,
		});

		res.status(200).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getProductCategoriesExportedInCsv = async (req, res) => {
	try {
		const productCategories = await productCategoryService.getAllProductCategories();
		// This returns MAIN categories each with subcategories[]

		if (!productCategories || productCategories.length === 0) {
			return res.status(200).send("No product categories found");
		}

		// Header
		let csv =
			"Category ID,Name,Type,Status,Parent Category ID,Created At\n";

		// Flatten rows for MAIN + SUB categories
		const rows = [];

		for (const main of productCategories) {
			// MAIN category row
			rows.push([
				main.categoryId,
				main.name,
				"MAIN",
				main.status,
				"", // no parent
				main.createdAt,
			].join(","));

			// SUB categories
			for (const sub of main.subcategories || []) {
				rows.push([
					sub.categoryId,
					sub.name,
					"SUB",
					sub.status,
					main.categoryId, // parent ID
					sub.createdAt,
				].join(","));
			}
		}

		csv += rows.join("\n");

		// Headers
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=product-categories.csv"
		);

		return res.status(200).send(csv);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to export CSV" });
	}
};

exports.getProductCategoryById = async (req, res) => {
	try {
		const productCategory = await productCategoryService.getProductCategoryById(req.params.id);
		if (!productCategory) return res.status(404).json({ message: "Product Category not found" });
		res.status(200).json(productCategory);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.updateProductCategoryWithSubs = async (req, res) => {
	try {
		const { parent, subCategories } = req.body;

		// Parent payload
		const payloadParent = {
			...parent,
			updatedAt: new Date().toISOString(),
		};

		// Sub-categories payload
		const payloadSubs = (subCategories || []).map((sub) => ({
			...sub,
			updatedAt: new Date().toISOString(),
		}));

		// Call your new service method
		const result = await productCategoryService.updateProductCategoryWithSubs(
			req.params.id, // parent category ID
			payloadParent,
			payloadSubs
		);

		res.status(200).json(result);
	} catch (err) {
		console.error("Update Transaction Error:", err);
		res.status(500).json({ message: err.message });
	}
};

exports.deleteProductCategory = async (req, res) => {
	try {
		await productCategoryService.deleteProductCategory(req.params.id);
		res.status(204).send();
	} catch (err) {
		if (err.message.includes("linked products exist")) {
			res.status(400).json({ message: "Cannot delete: Products exist in this category." });
		} else {
			console.error(err);
			res.status(500).json({ message: err.message });
		}
	}
};