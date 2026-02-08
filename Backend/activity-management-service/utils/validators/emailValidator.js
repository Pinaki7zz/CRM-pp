// validators/emailValidator.js
const { body, param, query } = require('express-validator');

const emailValidator = {
  validateEmailId: [
    param('id')
      .isUUID()
      .withMessage('Email ID must be a valid UUID')
  ],

  validateEmailFilters: [
    query('status')
      .optional()
      .isIn(['UNREAD', 'READ', 'ARCHIVED', 'DELETED', 'SPAM'])
      .withMessage('Invalid email status'),
    
    query('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  validateAutoReply: [
    param('id')
      .isUUID()
      .withMessage('Email ID must be a valid UUID'),
    
    body('message')
      .optional()
      .isString()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters')
  ]
};

module.exports = emailValidator;
