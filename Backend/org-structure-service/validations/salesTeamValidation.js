const Joi = require('joi');

const salesTeamSchema = Joi.object({
	salesTeamCode: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'Sales Team Code should be a string',
			'string.length': 'Sales Team Code should be exactly 4 characters',
			'string.pattern.base': 'Sales Team Code should be alphanumeric',
			'any.required': 'Sales Team Code is required'
		}),

	salesTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Sales Team Name should be a string',
			'string.max': 'Sales Team Name should not exceed 30 characters',
			'string.pattern.base': 'Sales Team Name should be alphanumeric',
			'any.required': 'Sales Team Name is required'
		})
});

const updateSalesTeamSchema = Joi.object({
	salesTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Sales Team Name should be a string',
			'string.max': 'Sales Team Name should not exceed 30 characters',
			'string.pattern.base': 'Sales Team Name should be alphanumeric',
			'any.required': 'Sales Team Name is required'
		})
});

const validateSalesTeam = (data) => {
	return salesTeamSchema.validate(data, { abortEarly: false });
};

const validateSalesTeamUpdate = (data) => {
	return updateSalesTeamSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateSalesTeam,
	validateSalesTeamUpdate
};