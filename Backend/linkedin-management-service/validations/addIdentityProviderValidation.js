const Joi = require('joi');

const identityProviderSchema = Joi.object({
  identityProviderName: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'Identity Provider Name must be at least 3 characters',
      'string.max': 'Identity Provider Name cannot exceed 100 characters'
    }),
  authenticationProtocol: Joi.string().valid('oauth2', 'saml', 'openid')
    .required()
    .messages({ 'any.only': 'Authentication Protocol must be oauth2, saml, or openid' }),
  authenticationFlowType: Joi.string().valid('authorization_code', 'implicit', 'client_credentials')
    .required()
    .messages({ 'any.only': 'Flow Type must be authorization_code, implicit, or client_credentials' }),
  clientId: Joi.string().optional()
    .when('authenticationProtocol', {
      is: 'oauth2',
      then: Joi.string().required().messages({ 'any.required': 'Client ID is required for OAuth2' })
    }),
  clientSecretKey: Joi.string().optional()
    .when('authenticationProtocol', {
      is: 'oauth2',
      then: Joi.string().required().messages({ 'any.required': 'Client Secret is required for OAuth2' })
    }),
  authorizedEndpointURL: Joi.string().uri().optional(),
  tokenEndpointURL: Joi.string().uri().optional(),
  userInfoEndpointURL: Joi.string().uri().optional(),
  checkboxCredentialsBody: Joi.boolean().default(false),
});

module.exports = { identityProviderSchema };