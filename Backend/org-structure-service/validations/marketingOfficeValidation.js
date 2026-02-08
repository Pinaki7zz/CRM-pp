const Joi = require('joi');

const marketingOfficeSchema = Joi.object({
	marketingOfficeId: Joi.string()
		.length(4)
		.pattern(/^[a-zA-Z0-9]+$/)
		.required()
		.messages({
			'string.base': 'ID should be a string',
			'string.length': 'ID should be exactly 4 characters',
			'string.pattern.base': 'ID should be alphanumeric',
			'any.required': 'ID is required'
		}),

	organizationName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Organization Name should be a string',
			'string.max': 'Organization Name should not exceed 30 characters',
			'string.pattern.base': 'Organization Name should be alphanumeric',
			'any.required': 'Organization Name is required'
		}),

	marketingOfficeDesc: Joi.string()
		.max(50)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.messages({
			'string.base': 'Marketing Office Description should be a string',
			'string.max': 'Marketing Office Description should not exceed 50 characters',
			'string.pattern.base': 'Marketing Office Description should be alphanumeric',
		}),

	street1: Joi.string()
		.max(50)
		.required()
		.messages({
			'string.base': 'Street 1 should be a string',
			'string.max': 'Street 1 should not exceed 50 characters',
			'any.required': 'Street 1 is required'
		}),

	street2: Joi.string()
		.max(50)
		.allow('', null)
		.messages({
			'string.base': 'Street 2 should be a string',
			'string.max': 'Street 2 should not exceed 50 characters'
		}),

	city: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/)
		.required()
		.messages({
			'string.base': 'City should be a string',
			'string.max': 'City should not exceed 30 characters',
			'string.pattern.base': 'City should contain only letters',
			'any.required': 'City is required'
		}),

	state: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/)
		.required()
		.messages({
			'string.base': 'State should be a string',
			'string.max': 'State should not exceed 30 characters',
			'string.pattern.base': 'State should contain only letters',
			'any.required': 'State is required'
		}),

	region: Joi.string()
		.max(50)
		.allow('', null)
		.messages({
			'string.base': 'Region should be a string',
			'string.max': 'Region should not exceed 50 characters'
		}),

	country: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/)
		.required()
		.messages({
			'string.base': 'Country should be a string',
			'string.max': 'Country should not exceed 30 characters',
			'string.pattern.base': 'Country should contain only letters',
			'any.required': 'Country is required'
		}),

	pinCode: Joi.string()
		.min(4)
		.max(6)
		.pattern(/^[0-9]+$/)
		.required()
		.messages({
			'string.base': 'Pin Code should be a string',
			'string.min': 'Pin Code should be between 4 to 6 digits',
			'string.max': 'Pin Code should be between 4 to 6 digits',
			'string.pattern.base': 'Pin Code should contain only numbers',
			'any.required': 'Pin Code is required'
		}),

	validFrom: Joi.date()
		.required()
		.messages({
			'any.base': 'Valid From should be a date',
			'any.required': 'Valid From is required'
		}),

	validTo: Joi.date()
		.required()
		.messages({
			'any.base': 'Valid From should be a date',
			'any.required': 'Valid To is required'
		}),

	company: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/)
		.required()
		.messages({
			'string.base': 'Company should be a string',
			'string.max': 'Company should not exceed 30 characters',
			'string.pattern.base': 'Company should be alphanumeric',
			'any.required': 'Company is required'
		}),

	parentUnit: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/)
		.messages({
			'string.base': 'Parent Unit should be a string',
			'string.max': 'Parent Unit should not exceed 30 characters',
			'string.pattern.base': 'Parent Unit should be alphanumeric',
		}),
});

const updateMarketingOfficeSchema = Joi.object({
	organizationName: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/),
	marketingOfficeDesc: Joi.string()
		.max(50)
		.pattern(/^[a-zA-Z0-9 ]+$/),
	street1: Joi.string().max(50),
	street2: Joi.string().max(50).allow('', null),
	city: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/),
	state: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/),
	region: Joi.string().max(50).allow('', null),
	country: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/),
	pinCode: Joi.string()
		.min(4)
		.max(6)
		.pattern(/^[0-9]+$/),
	validFrom: Joi.date(),
	validTo: Joi.date(),
	company: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z0-9 ]+$/),
	parentUnit: Joi.string()
		.max(30)
		.pattern(/^[a-zA-Z ]+$/)
		.allow('', null)
}).min(1);

const validateMarketingOffice = (data) => {
	return marketingOfficeSchema.validate(data, { abortEarly: false });
};

const validateMarketingOfficeUpdate = (data) => {
	return updateMarketingOfficeSchema.validate(data, { abortEarly: false });
};

module.exports = {
	validateMarketingOffice,
	validateMarketingOfficeUpdate
};