const Joi = require('joi');

// Schemas for each type
const identityProviderSchema = Joi.object({
  identityProviderName: Joi.string().required(),
  authenticationProtocol: Joi.string().required(),
  authenticationFlowType: Joi.string().required(),
  clientId: Joi.string().optional(),
  clientSecretKey: Joi.string().optional(),
  authorizedEndpointURL: Joi.string().optional(),
  tokenEndpointURL: Joi.string().optional(),
  userInfoEndpointURL: Joi.string().optional(),
  checkboxCredentialsBody: Joi.boolean().optional(),
});

const externalBodySchema = Joi.object({
  externalCredentialName: Joi.string().required(),
  authenticationProtocol: Joi.string().required(),
  authenticationFlowType: Joi.string().required(),
  identityProvider: Joi.string().required(),
  scope: Joi.string().optional(),
});

const principalSchema = Joi.object({
  principalName: Joi.string().required(),
  principalType: Joi.string().required(),
  status: Joi.string().optional(),
  scope: Joi.string().optional(),
  externalBodyId: Joi.number().optional(),
  integrationId: Joi.number().optional(),
});

const namedCredentialSchema = Joi.object({
  credentialName: Joi.string().required(),
  baseURL: Joi.string().required(),
  externalCredential: Joi.string().required(),
  enabledForCallouts: Joi.boolean().optional(),
  generateAuthorizationHeader: Joi.boolean().optional(),
});

const linkedinExternalSchema = Joi.object({
  externalCredentialName: Joi.string().required(),
  authenticationProtocol: Joi.string().required(),
  authenticationFlowType: Joi.string().required(),
  scope: Joi.string().optional(),
  providerName: Joi.string().required(),
  integrationId: Joi.number().required(),
});

module.exports = {
  identityProviderSchema,
  externalBodySchema,
  principalSchema,
  namedCredentialSchema,
  linkedinExternalSchema,
};