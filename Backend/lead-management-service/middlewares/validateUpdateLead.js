const { check, validationResult } = require("express-validator");

exports.validateUpdateLead = [
	// 🔹 Required IDs
	check("leadOwnerId")
		.notEmpty()
		.withMessage("Lead Owner is required"),

	// 🔹 Basic info
	check("firstName")
		.notEmpty()
		.withMessage("First Name is required"),

	check("lastName")
		.notEmpty()
		.withMessage("Last Name is required"),

	check("company")
		.notEmpty()
		.withMessage("Company name is required"),

	// 🔹 Email validation
	check("email")
		.notEmpty()
		.withMessage("Email is required")
		.bail()
		.isEmail()
		.withMessage("Invalid email format"),

	check("secondaryEmail")
		.optional({ checkFalsy: true })
		.isEmail()
		.withMessage("Invalid secondary email format"),

	// 🔹 Title (enum)
	check("title")
		.optional({ checkFalsy: true })
		.isIn(["MR", "MRS", "MS", "OTHERS"])
		.withMessage("Invalid title value"),

	// 🔹 Date of Birth
	check("dateOfBirth")
		.optional()
		.custom((value) => {
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid Date of Birth");
			}
			return true;
		}),

	// 🔹 Phone & website
	check("phoneNumber")
		.optional({ checkFalsy: true })
		.isLength({ min: 7, max: 15 })
		.withMessage("Phone number must be between 7 and 15 digits"),

	check("website")
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage("Invalid website URL"),

	check("fax")
		.optional({ checkFalsy: true })
		.isLength({ max: 20 })
		.withMessage("Fax number must be at most 20 characters"),

	// 🔹 Numbers
	check("budget")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0 })
		.withMessage("Budget must be a positive number"),

	check("potentialRevenue")
		.optional({ checkFalsy: true })
		.isFloat({ min: 0 })
		.withMessage("Potential Revenue must be a positive number"),

	// 🔹 Lead Source
	check("leadSource")
		.optional({ checkFalsy: true })
		.isIn([
			"MANUAL",
			"EMAIL",
			"COLD_CALL",
			"EMPLOYEE_REFERRAL",
			"EXTERNAL_REFERRAL",
			"SOCIAL_MEDIA",
			"WHATSAPP",
		])
		.withMessage("Invalid Lead Source"),

	// 🔹 Lead Status
	check("leadStatus")
		.optional({ checkFalsy: true })
		.isIn(["OPEN", "QUALIFIED", "IN_PROGRESS", "CONVERTED", "LOST"])
		.withMessage("Invalid Lead Status"),

	// 🔹 Interest Level
	check("interestLevel")
		.optional({ checkFalsy: true })
		.isIn(["COLD", "WARM", "HOT"])
		.withMessage("Invalid Interest Level"),

	// 🔹 Address Fields
	check("country")
		.optional({ checkFalsy: true })
		.isLength({ max: 50 })
		.withMessage("Country name must be at most 50 characters"),

	check("state")
		.optional({ checkFalsy: true })
		.isLength({ max: 50 })
		.withMessage("State name must be at most 50 characters"),

	check("city")
		.optional({ checkFalsy: true })
		.isLength({ max: 50 })
		.withMessage("City name must be at most 50 characters"),

	check("addressLine1")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Address Line 1 must be at most 100 characters"),

	check("addressLine2")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Address Line 2 must be at most 100 characters"),

	check("postalCode")
		.optional({ checkFalsy: true })
		.isLength({ min: 4, max: 10 })
		.withMessage("Invalid Postal Code"),

	check("notes")
		.optional({ checkFalsy: true })
		.isLength({ max: 1000 })
		.withMessage("Notes must be at most 1000 characters"),

	check("leadImage")
		.optional()
		.custom((value, { req }) => {
			if (!req.file) return true;

			const { size, mimetype } = req.file;

			const allowedTypes = ["image/jpeg", "image/png"];
			if (!allowedTypes.includes(mimetype)) {
				throw new Error("Invalid image type");
			}

			if (size < 250 * 1024 || size > 600 * 1024) {
				throw new Error("Image size must be between 250 KB and 600 KB");
			}

			return true;
		}),

	// 🔹 FINAL ERROR HANDLER (MANDATORY)
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
