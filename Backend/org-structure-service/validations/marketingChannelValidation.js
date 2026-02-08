const Joi = require('joi');

const marketingChannelSchema = Joi.object({
	marketingChannelCode: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Channel Code should be a string',
			'string.length': 'Marketing Channel Code should be exactly 4 characters',
			'string.pattern.base': 'Marketing Channel Code should be alphanumeric',
			'any.required': 'Marketing Channel Code is required'
		}),

	marketingChannelName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Channel Name should be a string',
			'string.max': 'Marketing Channel Name should not exceed 30 characters',
			'string.pattern.base': 'Marketing Channel Name should be alphanumeric',
			'any.required': 'Marketing Channel Name is required'
		}),

	marketingChannelDesc: Joi.string()
		.max(50)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.messages({
			'string.base': 'Description should be a string',
			'string.max': 'Description should not exceed 50 characters',
			'string.pattern.base': 'Description should be alphanumeric',
		}),
});

const updateMarketingChannelSchema = Joi.object({
	marketingChannelName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Marketing Channel Name should be a string',
			'string.max': 'Marketing Channel Name should not exceed 30 characters',
			'string.pattern.base': 'Marketing Channel Name should be alphanumeric',
			'any.required': 'Marketing Channel Name is required'
		})
});

const validateMarketingChannel = (data) => {
	return marketingChannelSchema.validate(data, { abortEarly: false });
};

const validateMarketingChannelUpdate = (data) => {
	return updateMarketingChannelSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateMarketingChannel,
	validateMarketingChannelUpdate
};