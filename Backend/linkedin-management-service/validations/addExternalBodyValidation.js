const Joi = require('joi');

const externalBodySchema = Joi.object({
  externalCredentialName: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'External Credential Name must be at least 3 characters',
      'string.max': 'External Credential Name cannot exceed 100 characters'
    }),
  authenticationProtocol: Joi.string().valid('oauth2', 'saml', 'openid')
    .required()
    .messages({ 'any.only': 'Authentication Protocol must be oauth2, saml, or openid' }),
  authenticationFlowType: Joi.string().valid('authorization_code', 'implicit', 'client_credentials')
    .required()
    .messages({ 'any.only': 'Flow Type must be authorization_code, implicit, or client_credentials' }),
  identityProvider: Joi.string().required()
    .messages({ 'any.required': 'Identity Provider is required' }),
  scope: Joi.string().optional(),
});

module.exports = { externalBodySchema };