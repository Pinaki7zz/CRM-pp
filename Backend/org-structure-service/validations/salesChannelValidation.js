const Joi = require('joi');

const salesChannelSchema = Joi.object({
  salesChannelCode: Joi.string()
    .length(4)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      'string.base': 'Sales Channel Code should be a string',
      'string.length': 'Sales Channel Code should be exactly 4 characters',
      'string.pattern.base': 'Sales Channel Code should be alphanumeric',
      'any.required': 'Sales Channel Code is required'
    }),

  salesChannelName: Joi.string()
    .max(30)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .required()
    .messages({
      'string.base': 'Sales Channel Name should be a string',
      'string.max': 'Sales Channel Name should not exceed 30 characters',
      'string.pattern.base': 'Sales Channel Name should be alphanumeric',
      'any.required': 'Sales Channel Name is required'
    }),

  salesChannelDesc: Joi.string()
    .max(50)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .messages({
      'string.base': 'Description should be a string',
      'string.max': 'Description should not exceed 50 characters',
      'string.pattern.base': 'Description should be alphanumeric',
    }),
});

const updateSalesChannelSchema = Joi.object({
  salesChannelName: Joi.string()
    .max(30)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .required()
    .messages({
      'string.base': 'Sales Channel Name should be a string',
      'string.max': 'Sales Channel Name should not exceed 30 characters',
      'string.pattern.base': 'Sales Channel Name should be alphanumeric',
      'any.required': 'Sales Channel Name is required'
    })
});

const validateSalesChannel = (data) => {
  return salesChannelSchema.validate(data, { abortEarly: false });
};

const validateSalesChannelUpdate = (data) => {
  return updateSalesChannelSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSalesChannel,
  validateSalesChannelUpdate
};