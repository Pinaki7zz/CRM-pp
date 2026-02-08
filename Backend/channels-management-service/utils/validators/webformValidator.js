const { body, param } = require('express-validator');

const createWebformValidator = [
  body('name')
    .notEmpty()
    .withMessage('Form name is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Form name must be between 3 and 100 characters'),

  body('module')
    .notEmpty()
    .withMessage('Module is required')
    .isIn(['Leads', 'Contacts', 'Cases'])
    .withMessage('Module must be one of: Leads, Contacts, Cases'),

  body('url')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('URL must be between 3 and 100 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('URL can only contain lowercase letters, numbers, and hyphens'),

  body('fields')
    .optional()
    .isArray()
    .withMessage('Fields must be an array'),

  body('formLocationUrls')
    .optional()
    .isArray()
    .withMessage('Form location URLs must be an array'),

  body('actionOnSubmission')
    .optional()
    .isIn(['redirect', 'thankyou', 'splash'])
    .withMessage('Action on submission must be one of: redirect, thankyou, splash'),

  body('customRedirectUrl')
    .optional()
    .trim(),

  body('thankYouMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Thank you message must not exceed 500 characters'),

  body('assignedOwner')
    .optional()
    .trim(),

  body('enableContactCreation')
    .optional()
    .isBoolean()
    .withMessage('Enable contact creation must be a boolean'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateWebformValidator = [
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  ...createWebformValidator
];

const getWebformValidator = [
  param('url')
    .notEmpty()
    .withMessage('URL parameter is required')
    .trim()
];

const submitWebformValidator = [
  body('webformId')
    .notEmpty()
    .withMessage('Webform ID is required')
    .trim(),

  body('fields')
    .notEmpty()
    .withMessage('Form fields are required')
    .isObject()
    .withMessage('Fields must be an object')
];

module.exports = {
  createWebformValidator,
  updateWebformValidator,
  getWebformValidator,
  submitWebformValidator
};
