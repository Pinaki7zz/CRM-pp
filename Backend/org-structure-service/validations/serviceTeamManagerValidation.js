const Joi = require('joi');

const serviceTeamManagerSchema = Joi.object({
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

	primary: Joi.boolean()
		.required()
		.messages({
			'boolean.base': 'Primary should be either true or false',
			'any.required': 'Primary is required'
		})
});

const updateServiceTeamManagerSchema = Joi.object({
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

const validateServiceTeamManager = (data) => {
	return serviceTeamManagerSchema.validate(data, { abortEarly: false });
};

const validateServiceTeamManagerUpdate = (data) => {
	return updateServiceTeamManagerSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateServiceTeamManager,
	validateServiceTeamManagerUpdate
};