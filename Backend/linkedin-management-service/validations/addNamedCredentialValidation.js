const Joi = require('joi');

const namedCredentialSchema = Joi.object({
  credentialName: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'Credential Name must be at least 3 characters',
      'string.max': 'Credential Name cannot exceed 100 characters'
    }),
  baseURL: Joi.string().uri().required()
    .messages({
      'string.uri': 'Base URL must be a valid URL',
      'any.required': 'Base URL is required'
    }),
  externalCredential: Joi.string().required()
    .messages({ 'any.required': 'External Credential name is required' }),
  enabledForCallouts: Joi.boolean().default(true),
  generateAuthorizationHeader: Joi.boolean().default(false),
});

module.exports = { namedCredentialSchema };