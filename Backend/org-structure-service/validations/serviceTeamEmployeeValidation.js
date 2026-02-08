const Joi = require('joi');

const serviceTeamEmployeeSchema = Joi.object({
	// serviceTeamCode: Joi.string()
	// 	.length(4)
	// 	.pattern(/^[a-zA-Z0-9]+$/)
	// 	.required()
	// 	.messages({
	// 		'string.base': 'Service Team Code should be a string',
	// 		'string.length': 'Service Team Code should be exactly 4 characters',
	// 		'string.pattern.base': 'Service Team Code should be alphanumeric',
	// 		'any.required': 'Service Team Code is required'
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

const updateServiceTeamEmployeeSchema = Joi.object({
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

const validateServiceTeamEmployee = (data) => {
	return serviceTeamEmployeeSchema.validate(data, { abortEarly: false });
};

const validateServiceTeamEmployeeUpdate = (data) => {
	return updateServiceTeamEmployeeSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateServiceTeamEmployee,
	validateServiceTeamEmployeeUpdate
};