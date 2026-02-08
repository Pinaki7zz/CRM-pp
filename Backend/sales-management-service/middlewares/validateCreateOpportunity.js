const { check, validationResult } = require("express-validator");

exports.validateCreateOpportunity = [
	check("opportunityOwnerId")
		.notEmpty()
		.withMessage("Owner ID is required"),

	check("accountId")
		.notEmpty()
		.withMessage("Account Name is required"),

	check("primaryContactId")
		.notEmpty()
		.withMessage("Primary Contact is required"),

	check("startDate")
		.notEmpty()
		.withMessage("Start Date is required")
		.bail()
		.custom((value) => {
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid date format");
			}
			return true;
		}),

	check("endDate")
		.notEmpty()
		.withMessage("End Date is required")
		.bail()
		.custom((value, { req }) => {
			const start = new Date(req.body.startDate);
			const end = new Date(value);

			if (isNaN(end.getTime())) throw new Error("Invalid end date format");
			if (start > end) throw new Error("End Date must be after Start Date");
			return true;
		}),

	check("name")
		.notEmpty()
		.withMessage("Opportunity Name is required"),

	check("stage")
		.notEmpty()
		.withMessage("Stage is required")
		.bail()
		.isIn(["QUALIFICATION", "NEEDS_ANALYSIS", "VALUE_PROPORTION", "PRICE_QUOTE", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"])
		.withMessage("Invalid stage value"),

	check("amount")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Amount must be a positive number"),

	check("status")
		.notEmpty()
		.withMessage("Status is required")
		.bail()
		.isIn(["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED"])
		.withMessage("Invalid status value"),

	check("leadSource")
		.optional({ checkFalsy: true })
		.isIn(["EMAIL", "WEB", "CALL", "REFERRAL", "SOCIAL_MEDIA"])
		.withMessage("Invalid lead source value"),

	check("probability")
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage("Probability must be a positive number between 0 and 100"),

	check("type")
		.optional({ checkFalsy: true })
		.isIn(["NEW_BUSINESS", "EXISTING_BUSINESS"])
		.withMessage("Invalid type value"),

	check("description")
		.optional(),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
