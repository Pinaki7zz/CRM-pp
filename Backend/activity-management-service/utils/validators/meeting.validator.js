// utils/validators/meeting.validator.js
const Joi = require('joi');

// Schema for creating a new meeting
const createMeetingSchema = Joi.object({
  subject: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Subject cannot be empty.',
    'string.min': 'Subject must be at least 3 characters long.',
    'string.max': 'Subject cannot exceed 255 characters.',
    'any.required': 'Subject is required.',
  }),
  
  location: Joi.string().trim().max(500).allow(null, '').messages({
    'string.max': 'Location cannot exceed 500 characters.',
  }),

  // IDs
  meetingOwnerId: Joi.string().required().messages({ 
    'string.empty': 'Meeting owner ID cannot be empty.',
    'any.required': 'Meeting owner is required.',
  }),
  primaryContactId: Joi.string().allow(null, ''),
  hostId: Joi.string().allow(null, ''),
  
  // New relational fields required by the controller
  leadId: Joi.string().allow(null, ''),
  accountId: Joi.string().allow(null, ''),
  relatedRecordId: Joi.string().allow(null, ''),

  relatedTo: Joi.string()
    .valid(
      'lead', 'contact', 'account', 'case', 'opportunity', 
      'sales quote', 'sales order', 'ticket', 
      'Lead', 'Contact', 'Account', 'Case', 'Opportunity', 
      'Sales Quote', 'Sales Order', 'Ticket'
    )
    .allow(null, '')
    .messages({
      'any.only': 'Related To must be a valid CRM object type (e.g., Lead, Ticket, Opportunity).',
    }),

  // Updated Status to include SCHEDULED and MISSED
  status: Joi.string()
    .valid('SCHEDULED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED')
    .default('SCHEDULED')
    .messages({
      'any.only': 'Status must be valid (e.g., SCHEDULED, OPEN, COMPLETED).',
    }),

  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    .default('MEDIUM')
    .messages({
      'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT.',
    }),

  fromDate: Joi.date().iso().allow(null).messages({
    'date.iso': 'From Date must be a valid ISO 8601 date string.',
  }),

  toDate: Joi.date().iso().min(Joi.ref('fromDate')).allow(null).messages({
    'date.iso': 'To Date must be a valid ISO 8601 date string.',
    'date.min': 'To Date cannot be before From Date.',
  }),

  participants: Joi.array().items(Joi.string().trim()).default([]).messages({
    'array.base': 'Participants must be an array of strings.',
  }),

  contactIds: Joi.array().items(Joi.string()).default([]).messages({ 
    'array.base': 'Contact IDs must be an array of strings.',
  }),

  participantReminder: Joi.string().allow(null, '').messages({
    'string.base': 'Participant Reminder must be a string.',
  }),

  description: Joi.string().trim().max(2000).allow(null, '').messages({
    'string.max': 'Description cannot exceed 2000 characters.',
  }),
}).unknown(true); // Allow unknown fields slightly for robustness, or keep .unknown(false) if strict.

// Schema for updating an existing meeting (all fields optional)
const updateMeetingSchema = Joi.object({
  subject: Joi.string().trim().min(3).max(255),
  location: Joi.string().trim().max(500).allow(null, ''),
  
  meetingOwnerId: Joi.string(),
  primaryContactId: Joi.string().allow(null, ''),
  hostId: Joi.string().allow(null, ''),
  leadId: Joi.string().allow(null, ''),
  accountId: Joi.string().allow(null, ''),
  relatedRecordId: Joi.string().allow(null, ''),

  relatedTo: Joi.string().allow(null, ''),
  
  status: Joi.string().valid('SCHEDULED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
  
  fromDate: Joi.date().iso().allow(null),
  toDate: Joi.date().iso().min(Joi.ref('fromDate')).allow(null),
  
  participants: Joi.array().items(Joi.string().trim()),
  contactIds: Joi.array().items(Joi.string()),
  
  participantReminder: Joi.string().allow(null, ''),
  description: Joi.string().trim().max(2000).allow(null, ''),
}).min(1).unknown(true).messages({
  'object.min': 'At least one field must be provided for update.',
});

// Middleware to validate create meeting requests
const validateCreateMeeting = (req, res, next) => {
  const { error } = createMeetingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  next();
};

// Middleware to validate update meeting requests
const validateUpdateMeeting = (req, res, next) => {
  const { error } = updateMeetingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  next();
};

module.exports = {
  validateCreateMeeting,
  validateUpdateMeeting,
};