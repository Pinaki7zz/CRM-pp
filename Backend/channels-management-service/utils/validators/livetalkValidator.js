const Joi = require('joi');

// Keyword-team pair validation schema - allow empty values
const keywordTeamPairSchema = Joi.object({
  keyword: Joi.string().allow('').optional(),
  team: Joi.string().allow('').optional()
});

// Chatflow validation schemas
const createChatflowSchema = Joi.object({
  // REQUIRED FIELDS ONLY
  chatId: Joi.string().required().min(1).max(100).pattern(/^[a-zA-Z0-9\-_]+$/),
  name: Joi.string().required().min(1).max(255),
  companyName: Joi.string().required().min(1).max(255),
  ownerUserId: Joi.string().required(),
  
  // ALL OTHER FIELDS ARE OPTIONAL
  // CORE SETTINGS
  welcomeMessage: Joi.string().allow('').default('Hi! How can we help you today?'),
  showAvatar: Joi.boolean().default(true),
  enableKnowledgeBase: Joi.boolean().default(false),
  
  // ASSIGNMENT SETTINGS - All optional with proper defaults
  autoAssignConversations: Joi.boolean().default(false),
  keywordTeamPairs: Joi.array().items(keywordTeamPairSchema).default([]), // Allow empty array
  fallbackTeam: Joi.string().allow('').optional(),
  assignedTeam: Joi.string().allow('').optional(),
  
  // EMAIL CAPTURE SETTINGS
  emailCaptureWhen: Joi.string().valid('never', 'before-conversation', 'after-first-message').default('never'),
  emailCaptureMessage: Joi.string().allow('').default('Please provide your email to continue'),
  
  // WEBSITE TARGETING FIELDS
  websiteUrl: Joi.string().uri().allow('').optional(),
  showOnAllPages: Joi.boolean().default(true),
  specificPages: Joi.string().allow('').optional(),
  excludePages: Joi.string().allow('').optional(),
  
  // DISPLAY SETTINGS
  accentColor: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
  chatPlacement: Joi.string().valid('bottom-right', 'bottom-left', 'top-right', 'top-left').default('bottom-right'),
  chatAvatar: Joi.string().uri().allow('').optional(),
  
  // OPTIONS
  language: Joi.string().valid('english', 'spanish', 'french', 'german').default('english'),
  requireConsent: Joi.boolean().default(false),
  enableFeedback: Joi.boolean().default(false),
  autoAssignment: Joi.boolean().default(true),
  
  // STATUS
  isActive: Joi.boolean().default(false),
  embedCode: Joi.string().allow('').optional()
});

const updateChatflowSchema = Joi.object({
  // All fields optional for updates (except chatId which shouldn't be updated)
  name: Joi.string().min(1).max(255).optional(),
  companyName: Joi.string().min(1).max(255).optional(),
  ownerUserId: Joi.string().optional(),
  
  // Core settings
  welcomeMessage: Joi.string().allow('').optional(),
  showAvatar: Joi.boolean().optional(),
  enableKnowledgeBase: Joi.boolean().optional(),
  
  // Assignment settings
  autoAssignConversations: Joi.boolean().optional(),
  keywordTeamPairs: Joi.array().items(keywordTeamPairSchema).optional(),
  fallbackTeam: Joi.string().allow('').optional(),
  assignedTeam: Joi.string().allow('').optional(),
  
  // Email capture
  emailCaptureWhen: Joi.string().valid('never', 'before-conversation', 'after-first-message').optional(),
  emailCaptureMessage: Joi.string().allow('').optional(),
  
  // Website targeting
  websiteUrl: Joi.string().uri().allow('').optional(),
  showOnAllPages: Joi.boolean().optional(),
  specificPages: Joi.string().allow('').optional(),
  excludePages: Joi.string().allow('').optional(),
  
  // Display settings
  accentColor: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).optional(),
  chatPlacement: Joi.string().valid('bottom-right', 'bottom-left', 'top-right', 'top-left').optional(),
  chatAvatar: Joi.string().uri().allow('').optional(),
  
  // Options
  language: Joi.string().valid('english', 'spanish', 'french', 'german').optional(),
  requireConsent: Joi.boolean().optional(),
  enableFeedback: Joi.boolean().optional(),
  autoAssignment: Joi.boolean().optional(),
  
  // Status
  isActive: Joi.boolean().optional(),
  embedCode: Joi.string().allow('').optional()
});

// Chatflow status update schema (for toggle active/inactive)
const updateChatflowStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.validatedQuery = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.validatedParams = value;
    next();
  };
};

// Common parameter schemas
const idParamSchema = Joi.object({
  id: Joi.string().required()
});

const chatflowQuerySchema = Joi.object({
  ownerUserId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  chatId: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0)
});

module.exports = {
  validate,
  validateQuery,
  validateParams,
  
  schemas: {
    createChatflow: createChatflowSchema,
    updateChatflow: updateChatflowSchema,
    updateChatflowStatus: updateChatflowStatusSchema,
    idParam: idParamSchema,
    chatflowQuery: chatflowQuerySchema,
    keywordTeamPair: keywordTeamPairSchema
  }
};
