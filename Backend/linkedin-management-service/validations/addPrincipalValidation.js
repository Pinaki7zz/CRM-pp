const Joi = require('joi');

const principalSchema = Joi.object({
  principalName: Joi.string().email().required()
    .messages({
      'string.email': 'Principal Name must be a valid email address',
      'any.required': 'Principal Name (email) is required'
    }),
  principalType: Joi.string().valid('user', 'service_account', 'system')
    .required()
    .default('user')
    .messages({ 'any.only': 'Principal Type must be user, service_account, or system' }),
  scope: Joi.string().optional()
    .allow('')
    .messages({ 'string.empty': 'Scope cannot be empty if provided' }),
  // ✅ REMOVED: No longer require externalBodyId/integrationId
  // externalBodyId: Joi.number().integer().positive().required(),
  // integrationId: Joi.number().integer().positive().required(),
});

module.exports = { principalSchema };