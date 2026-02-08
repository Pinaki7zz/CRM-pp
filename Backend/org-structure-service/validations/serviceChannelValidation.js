const Joi = require('joi');

const serviceChannelSchema = Joi.object({
	serviceChannelCode: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'Service Channel Code should be a string',
			'string.length': 'Service Channel Code should be exactly 4 characters',
			'string.pattern.base': 'Service Channel Code should be alphanumeric',
			'any.required': 'Service Channel Code is required'
		}),

	serviceChannelName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Service Channel Name should be a string',
			'string.max': 'Service Channel Name should not exceed 30 characters',
			'string.pattern.base': 'Service Channel Name should be alphanumeric',
			'any.required': 'Service Channel Name is required'
		}),

	serviceChannelDesc: Joi.string()
		.max(50)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.messages({
			'string.base': 'Description should be a string',
			'string.max': 'Description should not exceed 50 characters',
			'string.pattern.base': 'Description should be alphanumeric',
		}),
});

const updateServiceChannelSchema = Joi.object({
	serviceChannelName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Service Channel Name should be a string',
			'string.max': 'Service Channel Name should not exceed 30 characters',
			'string.pattern.base': 'Service Channel Name should be alphanumeric',
			'any.required': 'Service Channel Name is required'
		})
});

const validateServiceChannel = (data) => {
	return serviceChannelSchema.validate(data, { abortEarly: false });
};

const validateServiceChannelUpdate = (data) => {
	return updateServiceChannelSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateServiceChannel,
	validateServiceChannelUpdate
};