const Joi = require('joi');

const linkedinExternalSchema = Joi.object({
  externalCredentialName: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'External Credential Name must be at least 3 characters',
      'string.max': 'External Credential Name cannot exceed 100 characters'
    }),
  authenticationProtocol: Joi.string().valid('oauth2').required()
    .messages({ 'any.only': 'Authentication Protocol must be oauth2 for LinkedIn' }),
  authenticationFlowType: Joi.string().valid('authorization_code').required()
    .messages({ 'any.only': 'Flow Type must be authorization_code for LinkedIn' }),
  scope: Joi.string().optional()
    .allow('')
    .default('profile email w_member_social r_liteprofile r_emailaddress'),
  providerName: Joi.string().valid('LinkedIn').required()
    .messages({ 'any.only': 'Provider Name must be LinkedIn' }),
  // ✅ REMOVED: integrationId is now auto-assigned
  // integrationId: Joi.number().integer().positive().required(),
});

module.exports = { linkedinExternalSchema };