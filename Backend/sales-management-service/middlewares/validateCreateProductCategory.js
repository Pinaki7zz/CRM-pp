const { check, validationResult } = require("express-validator");

exports.validateCreateProductCategory = [
	// MAIN category validation
	check("parent.categoryId")
		.notEmpty()
		.withMessage("Main Category ID is required"),

	check("parent.name")
		.notEmpty()
		.withMessage("Main Category Name is required"),

	check("parent.status")
		.notEmpty()
		.withMessage("Main Category Status is required")
		.bail()
		.isIn(["ACTIVE", "INACTIVE", "CLOSED"])
		.withMessage("Invalid status value"),

	check("parent.productAssignmentAllowed")
		.isBoolean()
		.withMessage("productAssignmentAllowed must be a boolean"),

	check("parent.type")
		.notEmpty()
		.withMessage("Main Category type is required")
		.bail()
		.custom((value) => {
			if (value !== "MAIN") throw new Error("Type must be MAIN for parent");
			return true;
		}),

	check("parent.parentCategoryId")
		.custom((value, { req }) => {
			if (req.body.parent.type === "MAIN") {
				if (value !== null) {
					throw new Error("MAIN category cannot have a parentCategoryId");
				}
			}
			return true;
		}),

	// SUB-Categories validation
	check("subCategories")
		.isArray()
		.withMessage("subCategories must be an array"),

	check("subCategories.*.categoryId")
		.notEmpty()
		.withMessage("Sub-Category ID is required"),

	check("subCategories.*.name")
		.notEmpty()
		.withMessage("Sub-Category Name is required"),

	check("subCategories.*.status")
		.notEmpty()
		.withMessage("Sub-Category Status is required")
		.bail()
		.isIn(["ACTIVE", "INACTIVE", "CLOSED"])
		.withMessage("Invalid status value"),

	check("subCategories.*.productAssignmentAllowed")
		.isBoolean()
		.withMessage("Sub-Category productAssignmentAllowed must be boolean"),

	check("subCategories.*.type")
		.custom((value) => {
			if (value !== "SUB") throw new Error("Sub-Category type must be SUB");
			return true;
		}),

	// FINAL validation output
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
];
