
const Joi = require('joi');

const businessEntitySchema = Joi.object({
  businessEntityCode: Joi.string()
    .length(4)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
    .messages({
      'string.base': 'Business Entity Code should be a string',
      'string.pattern.base': 'Business Entity Code must be in the format BE followed by two digits (e.g., BE01 to BE99)',
      'any.only': 'Business Entity Code must be between BE01 and BE99'
    }),

  businessEntityName: Joi.string()
    .max(30)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .required()
    .messages({
      'string.base': 'Business Entity Name should be a string',
      'string.max': 'Business Entity Name should not exceed 30 characters',
      'string.pattern.base': 'Business Entity Name should be alphanumeric',
      'any.required': 'Business Entity Name is required'
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
});

const validateBusinessEntity = (data) => {
  return businessEntitySchema.validate(data, { abortEarly: false });
};

const createBusinessEntitySchema = businessEntitySchema;

const updateBusinessEntitySchema = Joi.object({
  businessEntityName: Joi.string()
    .max(30)
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
}).min(1);

const validateBusinessEntityCreate = (data) => {
  return createBusinessEntitySchema.validate(data, { abortEarly: false });
};

const validateBusinessEntityUpdate = (data) => {
  return updateBusinessEntitySchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateBusinessEntity,
  validateBusinessEntityCreate,
  validateBusinessEntityUpdate
};