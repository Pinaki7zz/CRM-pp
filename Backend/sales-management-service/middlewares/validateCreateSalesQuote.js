const { check, validationResult } = require("express-validator");

exports.validateCreateSalesQuote = [
	// --- VALIDATION FOR PARENT QUOTE DATA ---

	check("quoteData.quoteOwnerId")
		.notEmpty()
		.withMessage("Quote Owner is required"),

	check("quoteData.quoteId")
		.notEmpty()
		.withMessage("Quote ID is required"),

	check("quoteData.name")
		.trim()
		.notEmpty()
		.withMessage("Quote Name is required")
		.bail()
		.isLength({ max: 150 })
		.withMessage("Quote Name must be within 150 characters"),

	check("quoteData.opportunityId")
		.notEmpty()
		.withMessage("Opp. Name is required"),

	check("quoteData.accountId")
		.optional(),

	check("quoteData.primaryContactId")
		.optional(),

	check("quoteData.subject")
		.trim()
		.notEmpty()
		.withMessage("Subject is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Subject must be within 200 characters"),

	check("quoteData.amount")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0 })
		.withMessage("Amount must be a positive number")
		.toFloat(),

	check("quoteData.successRate")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0, max: 100 })
		.withMessage("Success Rate must be between 0 and 100")
		.toFloat(),

	check("quoteData.dueDate")
		.notEmpty()
		.withMessage("Due Date is required")
		.bail()
		.custom((value) => {
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid date format");
			}
			return true;
		}),

	check("quoteData.status")
		.optional({ checkFalsy: true })
		.isIn(["DRAFT", "SENT", "APPROVED", "ACCEPTED", "REJECTED"])
		.withMessage("Invalid status value"),

	// --- ADDRESS FIELDS ---

	check("quoteData.billingCountry")
		.notEmpty()
		.withMessage("Billing Country is required"),

	check("quoteData.billingState")
		.notEmpty()
		.withMessage("Billing State is required"),

	check("quoteData.billingCity")
		.notEmpty()
		.withMessage("Billing City is required"),

	check("quoteData.billingStreet")
		.trim()
		.notEmpty()
		.withMessage("Billing Street is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Billing Street must be within 200 characters"),

	check("quoteData.billingPostalCode")
		.trim()
		.notEmpty()
		.withMessage("Billing Postal Code is required")
		.bail()
		.isLength({ min: 4, max: 10 })
		.withMessage("Billing Postal Code must be between 4 and 10 characters"),

	check("quoteData.shippingCountry")
		.notEmpty()
		.withMessage("Shipping Country is required"),

	check("quoteData.shippingState")
		.notEmpty()
		.withMessage("Shipping State is required"),

	check("quoteData.shippingCity")
		.notEmpty()
		.withMessage("Shipping City is required"),

	check("quoteData.shippingStreet")
		.trim()
		.notEmpty()
		.withMessage("Shipping Street is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Shipping Street must be within 200 characters"),

	check("quoteData.shippingPostalCode")
		.trim()
		.notEmpty()
		.withMessage("Shipping Postal Code is required")
		.bail()
		.isLength({ min: 4, max: 10 })
		.withMessage("Shipping Postal Code must be between 4 and 10 characters"),

	check("quoteData.description")
		.trim()
		.optional()
		.isLength({ max: 300 })
		.withMessage("Description should be within 300 characters"),

	// --- VALIDATION FOR ITEMS ARRAY ---

	check("items")
		.isArray({ min: 1 })
		.withMessage("At least one product item is required"),

	// For each item in items[]
	check("items.*.quoteId")
		.notEmpty()
		.withMessage("Quote ID is required"),

	check("items.*.productId")
		.notEmpty()
		.withMessage("Product ID is required"),

	check("items.*.productName")
		.trim()
		.notEmpty()
		.withMessage("Product Name is required")
		.bail()
		.isLength({ max: 150 })
		.withMessage("Product Name must be within 150 characters"),

	check("items.*.quantity")
		.notEmpty()
		.withMessage("Quantity is required")
		.bail()
		.isInt({ min: 0 })
		.withMessage("Quantity must be a positive number")
		.toInt(),

	check("items.*.unitPrice")
		.notEmpty()
		.withMessage("Unit price is required")
		.bail()
		.isFloat({ min: 0 })
		.withMessage("Unit price must be a positive number")
		.toFloat(),

	check("items.*.discount")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0, max: 100 })
		.withMessage("Discount must be between 0 and 100")
		.toFloat(),

	check("items.*.tax")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0, max: 100 })
		.withMessage("Tax must be between 0 and 100")
		.toFloat(),

	check("items.*.totalPrice")
		.notEmpty()
		.withMessage("Total Price is required")
		.bail()
		.isFloat({ min: 0 })
		.withMessage("Total Price must be a positive number")
		.toFloat(),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
