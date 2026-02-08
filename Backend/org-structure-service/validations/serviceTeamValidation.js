const Joi = require('joi');

const serviceTeamSchema = Joi.object({
	serviceTeamCode: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'Service Team Code should be a string',
			'string.length': 'Service Team Code should be exactly 4 characters',
			'string.pattern.base': 'Service Team Code should be alphanumeric',
			'any.required': 'Service Team Code is required'
		}),

	serviceTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Service Team Name should be a string',
			'string.max': 'Service Team Name should not exceed 30 characters',
			'string.pattern.base': 'Service Team Name should be alphanumeric',
			'any.required': 'Service Team Name is required'
		})
});

const updateServiceTeamSchema = Joi.object({
	serviceTeamName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Service Team Name should be a string',
			'string.max': 'Service Team Name should not exceed 30 characters',
			'string.pattern.base': 'Service Team Name should be alphanumeric',
			'any.required': 'Service Team Name is required'
		})
});

const validateServiceTeam = (data) => {
	return serviceTeamSchema.validate(data, { abortEarly: false });
};

const validateServiceTeamUpdate = (data) => {
	return updateServiceTeamSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateServiceTeam,
	validateServiceTeamUpdate
};