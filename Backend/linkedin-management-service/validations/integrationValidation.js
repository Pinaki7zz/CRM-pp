// const Joi = require('joi');

// const integrationSchema = Joi.object({
//   providerType: Joi.string().required(),
//   providerName: Joi.string().required(),
//   clientId: Joi.string().required(),
//   clientSecretKey: Joi.string().required(),
//   authorizedEndpointURL: Joi.string().optional(),
//   tokenEndpointURL: Joi.string().optional(),
//   userInfoEndpointURL: Joi.string().optional(),
//   defaultScopes: Joi.string().optional(),
//   callBackURL: Joi.string().required(),
// });

// module.exports = { integrationSchema };


const Joi = require('joi');

const integrationSchema = Joi.object({
  providerType: Joi.string()
    .valid('linkedin', 'google', 'github', 'facebook') // restrict to known providers
    .required()
    .messages({
      'any.required': 'Provider type is required',
      'any.only': 'Provider type must be one of: linkedin, google, github, facebook'
    }),

  providerName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Provider name cannot be empty',
      'string.min': 'Provider name must be at least 3 characters',
      'string.max': 'Provider name must not exceed 50 characters'
    }),

  clientId: Joi.string()
    .pattern(/^[A-Za-z0-9_\-\.]+$/) // alphanumeric with some special chars
    .required()
    .messages({
      'string.pattern.base': 'Client ID contains invalid characters'
    }),

  clientSecretKey: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Client secret must be at least 10 characters long'
    }),

  authorizedEndpointURL: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Authorized endpoint must be a valid URL'
    }),

  tokenEndpointURL: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Token endpoint must be a valid URL'
    }),

  userInfoEndpointURL: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'User info endpoint must be a valid URL'
    }),

  defaultScopes: Joi.string()
    .pattern(/^[\w\s:_\-]+$/) // allows scopes like profile email w_member_social
    .optional()
    .messages({
      'string.pattern.base': 'Default scopes contain invalid characters'
    }),

  callBackURL: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'Callback URL is required',
      'string.uri': 'Callback URL must be a valid URL'
    })
});

module.exports = { integrationSchema };
