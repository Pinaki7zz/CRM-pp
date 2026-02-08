const { body } = require('express-validator');

const validateEmailChannel = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('channelName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Channel name must be between 1 and 255 characters'),
    
  body('senderDisplayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sender display name must be between 1 and 255 characters'),
    
  body('template')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Template must be less than 255 characters'),
    
  body('channelDirection')
    .optional()
    .isIn(['INBOUND_ONLY', 'INBOUND_OUTBOUND', 'OUTBOUND_ONLY'])
    .withMessage('Invalid channel direction'),
    
  body('subjectPattern')
    .optional()
    .isIn(['TICKET_SUBJECT', 'TICKET_DASH'])
    .withMessage('Invalid subject pattern'),
    
  body('channelType')
    .optional()
    .isIn(['B2B', 'B2C'])
    .withMessage('Invalid channel type')
];

const validateEmailChannelUpdate = [
  body('channelName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Channel name must be between 1 and 255 characters'),
    
  body('senderDisplayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sender display name must be between 1 and 255 characters'),
    
  body('template')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Template must be less than 255 characters'),
    
  body('channelDirection')
    .optional()
    .isIn(['INBOUND_ONLY', 'INBOUND_OUTBOUND', 'OUTBOUND_ONLY'])
    .withMessage('Invalid channel direction'),
    
  body('subjectPattern')
    .optional()
    .isIn(['TICKET_SUBJECT', 'TICKET_DASH'])
    .withMessage('Invalid subject pattern'),
    
  body('channelType')
    .optional()
    .isIn(['B2B', 'B2C'])
    .withMessage('Invalid channel type')
];

module.exports = {
  validateEmailChannel,
  validateEmailChannelUpdate
};
