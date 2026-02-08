const { body, param, query } = require('express-validator');

const phoneCallValidator = {
  // Validation for creating phone call
  create: [
    body('callFor')
      .notEmpty()
      .withMessage('Call For is required')
      .isIn(['LEADS', 'CONTACTS', 'CASES'])
      .withMessage('Call For must be one of: LEADS, CONTACTS, CASES'),

    body('relatedTo')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Related To must not exceed 255 characters')
      .custom((value, { req }) => {
        // Business logic: relatedTo should be empty for LEADS
        if (req.body.callFor === 'LEADS' && value) {
          throw new Error('Related To must be empty when Call For is LEADS');
        }
        return true;
      }),

    body('owner')
      .notEmpty()
      .withMessage('Owner is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Owner must be between 1 and 255 characters'),

    body('callTimeFrom')
      .optional()
      .isISO8601()
      .withMessage('Call Time From must be a valid datetime'),

    body('callTimeTo')
      .optional()
      .isISO8601()
      .withMessage('Call Time To must be a valid datetime')
      .custom((value, { req }) => {
        if (value && req.body.callTimeFrom && new Date(value) <= new Date(req.body.callTimeFrom)) {
          throw new Error('Call Time To must be after Call Time From');
        }
        return true;
      }),

    body('callType')
      .optional()
      .isIn(['INBOUND', 'OUTBOUND'])
      .withMessage('Call Type must be INBOUND or OUTBOUND'),

    body('status')
      .optional()
      .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY'])
      .withMessage('Status must be a valid call status'),

    body('primaryContactId')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Primary Contact ID must be valid'),

    body('subject')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Subject must not exceed 255 characters'),

    body('callPurpose')
      .optional()
      .isIn(['NEGOTIATION', 'DEMO', 'PROJECT', 'PROSPECTING'])
      .withMessage('Call Purpose must be one of: NEGOTIATION, DEMO, PROJECT, PROSPECTING'),

    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),

    body('contacts')
      .optional()
      .isArray()
      .withMessage('Contacts must be an array')
      .custom((contacts) => {
        if (contacts && contacts.length > 50) {
          throw new Error('Maximum 50 contacts allowed');
        }
        return true;
      })
  ],

  // Validation for updating phone call
  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid phone call ID format'),

    body('callFor')
      .optional()
      .isIn(['LEADS', 'CONTACTS', 'CASES'])
      .withMessage('Call For must be one of: LEADS, CONTACTS, CASES'),

    body('relatedTo')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Related To must not exceed 255 characters')
      .custom((value, { req }) => {
        if (req.body.callFor === 'LEADS' && value) {
          throw new Error('Related To must be empty when Call For is LEADS');
        }
        return true;
      }),

    body('owner')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Owner must be between 1 and 255 characters'),

    body('callTimeFrom')
      .optional()
      .isISO8601()
      .withMessage('Call Time From must be a valid datetime'),

    body('callTimeTo')
      .optional()
      .isISO8601()
      .withMessage('Call Time To must be a valid datetime')
      .custom((value, { req }) => {
        if (value && req.body.callTimeFrom && new Date(value) <= new Date(req.body.callTimeFrom)) {
          throw new Error('Call Time To must be after Call Time From');
        }
        return true;
      }),

    body('callType')
      .optional()
      .isIn(['INBOUND', 'OUTBOUND'])
      .withMessage('Call Type must be INBOUND or OUTBOUND'),

    body('status')
      .optional()
      .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY'])
      .withMessage('Status must be a valid call status'),

    body('primaryContactId')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Primary Contact ID must be valid'),

    body('subject')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Subject must not exceed 255 characters'),

    body('callPurpose')
      .optional()
      .isIn(['NEGOTIATION', 'DEMO', 'PROJECT', 'PROSPECTING'])
      .withMessage('Call Purpose must be one of: NEGOTIATION, DEMO, PROJECT, PROSPECTING'),

    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),

    body('contacts')
      .optional()
      .isArray()
      .withMessage('Contacts must be an array')
      .custom((contacts) => {
        if (contacts && contacts.length > 50) {
          throw new Error('Maximum 50 contacts allowed');
        }
        return true;
      })
  ],

  // Validation for updating status only
  updateStatus: [
    param('id')
      .isUUID()
      .withMessage('Invalid phone call ID format'),

    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY'])
      .withMessage('Status must be a valid call status')
  ],

  // Validation for getting phone call by ID
  getById: [
    param('id')
      .isUUID()
      .withMessage('Invalid phone call ID format')
  ],

  // Validation for delete
  delete: [
    param('id')
      .isUUID()
      .withMessage('Invalid phone call ID format')
  ],

  // Validation for query parameters
  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('status')
      .optional()
      .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY'])
      .withMessage('Status must be a valid call status'),

    query('callFor')
      .optional()
      .isIn(['LEADS', 'CONTACTS', 'CASES'])
      .withMessage('Call For must be one of: LEADS, CONTACTS, CASES'),

    query('owner')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Owner must be between 1 and 255 characters')
  ]
};

module.exports = phoneCallValidator;
