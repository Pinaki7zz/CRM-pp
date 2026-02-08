const agentSupportService = require('../services/agentSupport.service');

// Get tickets with comprehensive filtering for Agent Support
exports.getTicketsForAgentSupport = async (req, res) => {
    try {
        const filters = req.query;
        console.log('Agent Support filters received:', filters);
        
        const tickets = await agentSupportService.getFilteredTickets(filters);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets for agent support:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get tickets by specific view type (all-tickets, my-tickets, etc.)
exports.getTicketsByView = async (req, res) => {
    try {
        const { viewType } = req.params;
        const additionalFilters = req.query;
        
        console.log(`Fetching tickets for view: ${viewType}`);
        
        const tickets = await agentSupportService.getTicketsByView(viewType, additionalFilters);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets by view:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get available owners for filter dropdown
exports.getAvailableOwners = async (req, res) => {
    try {
        const owners = await agentSupportService.getAvailableOwners();
        res.json(owners);
    } catch (error) {
        console.error('Error fetching available owners:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get Agent Support statistics
exports.getAgentSupportStats = async (req, res) => {
    try {
        const stats = await agentSupportService.getAgentSupportStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching agent support stats:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Quick update individual ticket
exports.quickUpdateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const updateData = req.body;
        
        console.log(`Quick updating ticket ${ticketId}:`, updateData);
        
        const updatedTicket = await agentSupportService.quickUpdateTicket(ticketId, updateData);
        res.json(updatedTicket);
    } catch (error) {
        console.error('Error quick updating ticket:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Bulk assign tickets to agent
exports.bulkAssignTickets = async (req, res) => {
    try {
        const { ticketIds, agentName, assignedBy } = req.body;
        
        console.log(`Bulk assigning ${ticketIds.length} tickets to ${agentName}`);
        
        const result = await agentSupportService.bulkAssignTickets(ticketIds, agentName, assignedBy);
        res.json(result);
    } catch (error) {
        console.error('Error bulk assigning tickets:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Bulk update ticket status
exports.bulkUpdateStatus = async (req, res) => {
    try {
        const { ticketIds, status, updatedBy } = req.body;
        
        console.log(`Bulk updating ${ticketIds.length} tickets to status: ${status}`);
        
        const result = await agentSupportService.bulkUpdateStatus(ticketIds, status, updatedBy);
        res.json(result);
    } catch (error) {
        console.error('Error bulk updating status:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Bulk update ticket priority
exports.bulkUpdatePriority = async (req, res) => {
    try {
        const { ticketIds, priority, updatedBy } = req.body;
        
        console.log(`Bulk updating ${ticketIds.length} tickets to priority: ${priority}`);
        
        const result = await agentSupportService.bulkUpdatePriority(ticketIds, priority, updatedBy);
        res.json(result);
    } catch (error) {
        console.error('Error bulk updating priority:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Bulk delete tickets
exports.bulkDeleteTickets = async (req, res) => {
    try {
        const { ticketIds, deletedBy } = req.body;
        
        console.log(`Bulk deleting ${ticketIds.length} tickets`);
        
        const result = await agentSupportService.bulkDeleteTickets(ticketIds, deletedBy);
        res.json(result);
    } catch (error) {
        console.error('Error bulk deleting tickets:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get agent activities
exports.getAgentActivities = async (req, res) => {
    try {
        const { agentName } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const activities = await agentSupportService.getAgentActivities(agentName, parseInt(limit), parseInt(offset));
        res.json(activities);
    } catch (error) {
        console.error('Error fetching agent activities:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Log agent activity
exports.logAgentActivity = async (req, res) => {
    try {
        const activityData = req.body;
        const activity = await agentSupportService.logAgentActivity(activityData);
        res.status(201).json(activity);
    } catch (error) {
        console.error('Error logging agent activity:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Get agent configuration
exports.getAgentConfig = async (req, res) => {
    try {
        const { agentName } = req.params;
        const config = await agentSupportService.getAgentConfig(agentName);
        res.json(config);
    } catch (error) {
        console.error('Error fetching agent config:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// Create or update agent configuration
exports.createOrUpdateAgentConfig = async (req, res) => {
    try {
        const configData = req.body;
        const config = await agentSupportService.createOrUpdateAgentConfig(configData);
        res.json(config);
    } catch (error) {
        console.error('Error creating/updating agent config:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};
