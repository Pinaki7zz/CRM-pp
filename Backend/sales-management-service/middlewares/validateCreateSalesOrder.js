const { check, validationResult } = require("express-validator");

exports.validateCreateSalesOrder = [
	// --- VALIDATION FOR PARENT ORDER DATA ---

	check("orderData.orderOwnerId")
		.notEmpty()
		.withMessage("Order Owner is required"),

	check("orderData.orderId")
		.notEmpty()
		.withMessage("Order ID is required"),

	check("orderData.name")
		.trim()
		.notEmpty()
		.withMessage("Order Name is required")
		.bail()
		.isLength({ max: 150 })
		.withMessage("Order Name must be within 150 characters"),

	check("orderData.opportunityId")
		.notEmpty()
		.withMessage("Opp. Name is required"),

	check("orderData.accountId")
		.notEmpty()
		.withMessage("Account Name is required"),

	check("orderData.primaryContactId")
		.notEmpty()
		.withMessage("Primary Contact is required"),

	check("orderData.subject")
		.trim()
		.notEmpty()
		.withMessage("Subject is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Subject must be within 200 characters"),

	check("orderData.amount")
		.notEmpty()
		.withMessage("Amount is required")
		.bail()
		.isFloat({ min: 0 })
		.withMessage("Amount must be a positive number")
		.toFloat(),

	check("orderData.purchaseOrder")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Purchase Order must be within 50 characters"),

	check("orderData.dueDate")
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

	check("orderData.status")
		.notEmpty()
		.withMessage("Status is required")
		.bail()
		.isIn(["PENDING", "CONFIRMED", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"])
		.withMessage("Invalid status value"),

	check("orderData.commission")
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage("Commission must be between 0 and 100")
		.toFloat(),

	check("orderData.budget")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Budget must be a positive number")
		.toFloat(),

	// --- ADDRESS FIELDS ---

	check("orderData.billingCountry")
		.notEmpty()
		.withMessage("Billing Country is required"),

	check("orderData.billingState")
		.notEmpty()
		.withMessage("Billing State is required"),

	check("orderData.billingCity")
		.notEmpty()
		.withMessage("Billing City is required"),

	check("orderData.billingStreet")
		.trim()
		.notEmpty()
		.withMessage("Billing Street is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Billing Street must be within 200 characters"),

	check("orderData.billingPostalCode")
		.trim()
		.notEmpty()
		.withMessage("Billing Postal Code is required")
		.bail()
		.isLength({ min: 4, max: 10 })
		.withMessage("Billing Postal Code must be between 4 and 10 characters"),

	check("orderData.shippingCountry")
		.notEmpty()
		.withMessage("Shipping Country is required"),

	check("orderData.shippingState")
		.notEmpty()
		.withMessage("Shipping State is required"),

	check("orderData.shippingCity")
		.notEmpty()
		.withMessage("Shipping City is required"),

	check("orderData.shippingStreet")
		.trim()
		.notEmpty()
		.withMessage("Shipping Street is required")
		.bail()
		.isLength({ max: 200 })
		.withMessage("Shipping Street must be within 200 characters"),

	check("orderData.shippingPostalCode")
		.trim()
		.notEmpty()
		.withMessage("Shipping Postal Code is required")
		.bail()
		.isLength({ min: 4, max: 10 })
		.withMessage("Shipping Postal Code must be between 4 and 10 characters"),

	check("orderData.description")
		.trim()
		.optional()
		.isLength({ max: 300 })
		.withMessage("Description should be within 300 characters"),

	// --- VALIDATION FOR ITEMS ARRAY ---

	check("items")
		.isArray({ min: 1 })
		.withMessage("At least one product item is required"),

	// For each item in items[]
	check("items.*.orderId")
		.notEmpty()
		.withMessage("Order ID is required"),

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
		.withMessage("Billing Amount is required")
		.bail()
		.isFloat({ min: 0 })
		.withMessage("Billing Amount must be a positive number")
		.toFloat(),

	check("items.*.discount")
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage("Discount must be between 0 and 100")
		.toFloat(),

	check("items.*.tax")
		.notEmpty()
		.withMessage("Tax is required")
		.bail()
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
