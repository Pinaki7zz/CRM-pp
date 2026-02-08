const Joi = require('joi');

// Base schema for all fields
const baseSchema = {
    businessUnitCode: Joi.string()
        .length(4)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
        .messages({
            'string.base': 'Business Unit Code must be a string',
            'string.length': 'Business Unit Code must be exactly 4 characters',
            'string.pattern.base': 'Business Unit Code must be alphanumeric',
            'any.required': 'Business Unit Code is required'
        }),

    businessUnitDesc: Joi.string()
        .max(30)
        .pattern(/^[a-zA-Z0-9 ]+$/)
        .required()
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 30 characters',
            'string.pattern.base': 'Description can only contain letters, numbers and spaces',
            'any.required': 'Description is required'
        }),

    street1: Joi.string()
        .max(50)
        .required()
        .messages({
            'string.base': 'Street address must be a string',
            'string.max': 'Street address cannot exceed 50 characters',
            'any.required': 'Street address is required'
        }),

    street2: Joi.string()
        .max(50)
        .allow('', null)
        .messages({
            'string.base': 'Secondary address must be a string',
            'string.max': 'Secondary address cannot exceed 50 characters'
        }),

    city: Joi.string()
        .max(30)
        .pattern(/^[a-zA-Z ]+$/)
        .required()
        .messages({
            'string.base': 'City must be a string',
            'string.max': 'City cannot exceed 30 characters',
            'string.pattern.base': 'City can only contain letters',
            'any.required': 'City is required'
        }),

    state: Joi.string()
        .max(30)
        .pattern(/^[a-zA-Z ]+$/)
        .required()
        .messages({
            'string.base': 'State must be a string',
            'string.max': 'State cannot exceed 30 characters',
            'string.pattern.base': 'State can only contain letters',
            'any.required': 'State is required'
        }),

    region: Joi.string()
        .max(50)
        .allow('', null)
        .messages({
            'string.base': 'Region must be a string',
            'string.max': 'Region cannot exceed 50 characters'
        }),

    country: Joi.string()
        .max(30)
        .pattern(/^[a-zA-Z ]+$/)
        .required()
        .messages({
            'string.base': 'Country must be a string',
            'string.max': 'Country cannot exceed 30 characters',
            'string.pattern.base': 'Country can only contain letters',
            'any.required': 'Country is required'
        }),

    pinCode: Joi.string()
        .min(4)
        .max(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.base': 'Postal code must be a string',
            'string.min': 'Postal code must be 4-6 digits',
            'string.max': 'Postal code must be 4-6 digits',
            'string.pattern.base': 'Postal code can only contain numbers',
            'any.required': 'Postal code is required'
        }),

    salesChannelId: Joi.string()
        .length(4)
        .pattern(/^[a-zA-Z0-9]+$/)
        .allow(null, '')
        .messages({
            'string.base': 'Sales Channel ID must be a string',
            'string.length': 'Sales Channel ID must be exactly 4 characters',
            'string.pattern.base': 'Sales Channel ID must be alphanumeric'
        }),

    salesOfficeCode: Joi.string()
        .length(4)
        .pattern(/^[a-zA-Z0-9]+$/)
        .allow(null, '')
        .messages({
            'string.base': 'Office Code must be a string',
            'string.length': 'Office Code must be exactly 4 characters',
            'string.pattern.base': 'Office Code must be alphanumeric'
        })
};

// Enhanced relationship validator with optional relationships
const relationshipValidator = (value, helpers) => {
    const hasSales = !!(value.salesOfficeCode || value.salesChannelId);

    if (hasSales) {
        if (!value.salesChannelId || !value.salesOfficeCode) {
            return helpers.error('any.required', {
                message: 'When providing sales relationships, both Sales Channel ID and Sales Office Code must be provided'
            });
        }
    }

    return value;
};

// Create schema with custom validation
const createSchema = Joi.object(baseSchema)
    .custom(relationshipValidator)
    .messages({
        'object.unknown': 'Field "{{#label}}" is not allowed',
        'object.base': 'Request body must be a valid object',
        'any.invalid': '{{#message}}',
        'any.required': '{{#message}}'
    });

// Update schema with restricted fields
const updateSchema = Joi.object({
    businessUnitCode: baseSchema.businessUnitCode.optional(),
    businessUnitDesc: baseSchema.businessUnitDesc.optional(),
    street1: baseSchema.street1.optional(),
    street2: baseSchema.street2,
    city: baseSchema.city.optional(),
    state: baseSchema.state.optional(),
    region: baseSchema.region,
    country: baseSchema.country.optional(),
    pinCode: baseSchema.pinCode.optional(),
    salesChannelId: baseSchema.salesChannelId,
    salesOfficeCode: baseSchema.salesOfficeCode
})
.min(1)
.messages({
    'object.unknown': 'Field "{{#label}}" is not allowed for updates',
    'object.min': 'At least one valid field must be provided for update'
});

// Validation functions with improved error handling
const validateBusinessUnit = (data) => {
    const { error, value } = createSchema.validate(data, { 
        abortEarly: false,
        allowUnknown: false
    });

    if (error) {
        return {
            error: {
                name: 'ValidationError',
                message: 'Business Unit validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/['"]+/g, ''),
                    type: detail.type
                }))
            }
        };
    }

    return { value };
};

const validateBusinessUnitUpdate = (data) => {
    const { error, value } = updateSchema.validate(data, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
    });

    if (error) {
        return {
            error: {
                name: 'ValidationError',
                message: 'Business Unit update validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/['"]+/g, ''),
                    type: detail.type
                }))
            }
        };
    }

    return { value };
};

module.exports = {
    validateBusinessUnit,
    validateBusinessUnitUpdate,
    businessUnitSchema: createSchema
};