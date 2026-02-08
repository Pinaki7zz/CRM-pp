const Joi = require('joi');

const marketingTeamSchema = Joi.object({
	marketingTeamCode: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Team Code should be a string',
			'string.length': 'Marketing Team Code should be exactly 4 characters',
			'string.pattern.base': 'Marketing Team Code should be alphanumeric',
			'any.required': 'Marketing Team Code is required'
		}),

	marketingTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Team Name should be a string',
			'string.max': 'Marketing Team Name should not exceed 30 characters',
			'string.pattern.base': 'Marketing Team Name should be alphanumeric',
			'any.required': 'Marketing Team Name is required'
		})
});

const updateMarketingTeamSchema = Joi.object({
	marketingTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Team Name should be a string',
			'string.max': 'Marketing Team Name should not exceed 30 characters',
			'string.pattern.base': 'Marketing Team Name should be alphanumeric',
			'any.required': 'Marketing Team Name is required'
		})
});

const validateMarketingTeam = (data) => {
	return marketingTeamSchema.validate(data, { abortEarly: false });
};

const validateMarketingTeamUpdate = (data) => {
	return updateMarketingTeamSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateMarketingTeam,
	validateMarketingTeamUpdate
};