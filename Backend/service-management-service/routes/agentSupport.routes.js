const express = require('express');
const router = express.Router();
const agentSupportController = require('../controllers/agentSupport.controller');

// Import the safe validator
const validator = require('../utils/agentSupport.validator.js');

// Your existing routes with optional validation (won't break if validation fails)
router.get('/tickets', 
    validator.validateGetTickets,  // ✅ Adds validation but won't break
    agentSupportController.getTicketsForAgentSupport
);

router.get('/tickets/view/:viewType',
    validator.validateGetTicketsByView,  // ✅ Adds validation but won't break
    agentSupportController.getTicketsByView
);

router.get('/owners', 
    validator.validateGetOwners,  // ✅ Just passes through for now
    agentSupportController.getAvailableOwners
);

router.get('/stats', 
    validator.validateGetStats,  // ✅ Just passes through for now
    agentSupportController.getAgentSupportStats
);

router.put('/tickets/:ticketId/quick-update',
    validator.validateQuickUpdate,  // ✅ Adds validation but won't break
    agentSupportController.quickUpdateTicket
);

// These routes will work exactly as before
router.post('/tickets/bulk-assign', 
    validator.validateBulkAssign,  // ✅ Just passes through for now
    agentSupportController.bulkAssignTickets
);

router.put('/tickets/bulk-status', 
    validator.validateBulkUpdateStatus,  // ✅ Just passes through for now
    agentSupportController.bulkUpdateStatus
);

router.put('/tickets/bulk-priority', 
    validator.validateBulkUpdatePriority,  // ✅ Just passes through for now
    agentSupportController.bulkUpdatePriority
);

router.delete('/tickets/bulk-delete', 
    validator.validateBulkDelete,  // ✅ Just passes through for now
    agentSupportController.bulkDeleteTickets
);

router.get('/activities/:agentName', 
    validator.validateGetActivities,  // ✅ Just passes through for now
    agentSupportController.getAgentActivities
);

router.post('/activities', 
    validator.validateLogActivity,  // ✅ Just passes through for now
    agentSupportController.logAgentActivity
);

router.get('/config/:agentName', 
    validator.validateGetConfig,  // ✅ Just passes through for now
    agentSupportController.getAgentConfig
);

router.post('/config', 
    validator.validateCreateUpdateConfig,  // ✅ Just passes through for now
    agentSupportController.createOrUpdateAgentConfig
);

module.exports = router;
