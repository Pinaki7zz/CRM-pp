const Joi = require('joi');

const salesTeamEmployeeSchema = Joi.object({
	// salesTeamCode: Joi.string()
	// 	.length(4)
	// 	.pattern(/^[a-zA-Z0-9]+$/)
	// 	.required()
	// 	.messages({
	// 		'string.base': 'Sales Team Code should be a string',
	// 		'string.length': 'Sales Team Code should be exactly 4 characters',
	// 		'string.pattern.base': 'Sales Team Code should be alphanumeric',
	// 		'any.required': 'Sales Team Code is required'
	// 	}),

	userId: Joi.string()
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'User ID should be a string',
			'string.pattern.base': 'User ID should be alphanumeric',
			'any.required': 'User ID is required'
		}),

	validFrom: Joi.date()
		.required()
		.messages({
			'date.base': 'Valid From should be a valid date',
			'any.required': 'Valid From is required'
		}),

	validTo: Joi.optional(),

	job: Joi.string()
		.pattern(/^[a-zA-Z ]+$/)
		.messages({
			'string.base': 'Job should be a string',
			'string.pattern.base': 'Job should only have alphabets',
		}),

	primary: Joi.boolean()
		.required()
		.messages({
			'boolean.base': 'Primary should be either true or false',
			'any.required': 'Primary is required'
		})
});

const updateSalesTeamEmployeeSchema = Joi.object({
	userId: Joi.string()
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.messages({
			'string.base': 'User ID should be a string',
			'string.pattern.base': 'User ID should be alphanumeric',
		}),

	validFrom: Joi.date()
		.messages({
			'date.base': 'Valid From should be a valid date',
		}),

	primary: Joi.boolean()
		.messages({
			'boolean.base': 'Primary should be either true or false',
		})
});

const validateSalesTeamEmployee = (data) => {
	return salesTeamEmployeeSchema.validate(data, { abortEarly: false });
};

const validateSalesTeamEmployeeUpdate = (data) => {
	return updateSalesTeamEmployeeSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateSalesTeamEmployee,
	validateSalesTeamEmployeeUpdate
};