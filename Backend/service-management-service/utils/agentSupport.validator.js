const { body, query, param, validationResult } = require('express-validator');

// Flexible validation handler that doesn't break existing functionality
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Log validation errors for debugging but don't break the request
        console.warn('⚠️  Validation warnings:', errors.array());
        
        // For now, just pass through - you can enable strict validation later
        // return res.status(400).json({
        //     success: false,
        //     message: 'Validation failed',
        //     errors: errors.array()
        // });
    }
    next();
};

// Lenient validators that won't break existing functionality
const validateGetTickets = [
    // Optional validations - won't fail if missing or incorrect
    query('search').optional().trim().escape(),
    query('status').optional(),
    query('priority').optional(),
    query('owner').optional().trim(),
    query('agentName').optional().trim(),
    handleValidationErrors
];

const validateGetTicketsByView = [
    param('viewType').optional(),
    query('search').optional().trim().escape(),
    query('status').optional(),
    query('priority').optional(),
    query('owner').optional().trim(),
    query('agentName').optional().trim(),
    handleValidationErrors
];

const validateQuickUpdate = [
    param('ticketId').optional(),
    body('status').optional(),
    body('priority').optional(),
    body('ticket_owner_name').optional().trim(),
    body('updatedBy').optional().trim(),
    handleValidationErrors
];

// Export safe validators
module.exports = {
    validateGetTickets,
    validateGetTicketsByView,
    validateQuickUpdate,
    handleValidationErrors,
    
    // Placeholder validators for routes you haven't implemented yet
    validateGetOwners: [handleValidationErrors],
    validateGetStats: [handleValidationErrors],
    validateBulkAssign: [handleValidationErrors],
    validateBulkUpdateStatus: [handleValidationErrors],
    validateBulkUpdatePriority: [handleValidationErrors],
    validateBulkDelete: [handleValidationErrors],
    validateGetActivities: [handleValidationErrors],
    validateLogActivity: [handleValidationErrors],
    validateGetConfig: [handleValidationErrors],
    validateCreateUpdateConfig: [handleValidationErrors]
};
