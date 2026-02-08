const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import existing ticket service for data enrichment
const ticketService = require('./ticket.service');

// Get filtered tickets for Agent Support with search and filters
exports.getFilteredTickets = async (filters = {}) => {
    try {
        console.log('Building where clause with filters:', filters);
        const whereClause = this.buildWhereClause(filters);
        
        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log(`Found ${tickets.length} tickets matching filters`);

        // Use existing ticket service to enrich data with external APIs
        return await this.enrichTicketsWithExternalData(tickets);
    } catch (error) {
        console.error('Error in getFilteredTickets:', error);
        throw error;
    }
};

// Get tickets by specific view type
exports.getTicketsByView = async (viewType, additionalFilters = {}) => {
    try {
        let viewFilters = {};

        // Define filters based on view type
        switch (viewType) {
            case 'all-tickets':
                // No additional filters - show all tickets
                break;
            
            case 'my-tickets':
                // Filter by current user - you'll need to pass agent name
                if (additionalFilters.agentName) {
                    viewFilters.ticket_owner_name = additionalFilters.agentName;
                }
                break;
            
            case 'closed-tickets':
                viewFilters.status = 'CLOSED';
                break;
            
            case 'open-tickets':
                viewFilters.status = 'OPEN';
                break;
            
            case 'last-7-days':
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                viewFilters.created_at = {
                    gte: sevenDaysAgo
                };
                break;
            
            default:
                console.warn(`Unknown view type: ${viewType}`);
                break;
        }

        // Combine view filters with additional filters
        const combinedFilters = { ...viewFilters, ...additionalFilters };
        
        // Remove the viewType and agentName from the filters to avoid conflicts
        delete combinedFilters.viewType;
        delete combinedFilters.agentName;
        
        return await this.getFilteredTickets(combinedFilters);
    } catch (error) {
        console.error('Error in getTicketsByView:', error);
        throw error;
    }
};

// Get available ticket owners for filter dropdown
exports.getAvailableOwners = async () => {
    try {
        const owners = await prisma.ticket.findMany({
            where: {
                ticket_owner_name: {
                    not: null,
                    notIn: ['', '-']
                }
            },
            select: {
                ticket_owner_name: true
            },
            distinct: ['ticket_owner_name']
        });

        return owners
            .map(owner => owner.ticket_owner_name)
            .filter(name => name && name.trim() !== '' && name !== '-')
            .sort();
    } catch (error) {
        console.error('Error in getAvailableOwners:', error);
        throw error;
    }
};

// Get Agent Support statistics
exports.getAgentSupportStats = async () => {
    try {
        // Total tickets count
        const totalTickets = await prisma.ticket.count();

        // Status breakdown
        const statusStats = await prisma.ticket.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });

        // Priority breakdown
        const priorityStats = await prisma.ticket.groupBy({
            by: ['priority'],
            _count: {
                priority: true
            }
        });

        // Recent activity (tickets created in last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const recentTickets = await prisma.ticket.count({
            where: {
                created_at: {
                    gte: yesterday
                }
            }
        });

        // Top owners by ticket count
        const topOwners = await prisma.ticket.groupBy({
            by: ['ticket_owner_name'],
            where: {
                ticket_owner_name: {
                    not: null,
                    notIn: ['', '-']
                }
            },
            _count: {
                ticket_owner_name: true
            },
            orderBy: {
                _count: {
                    ticket_owner_name: 'desc'
                }
            },
            take: 5
        });

        return {
            totalTickets,
            recentTickets,
            statusBreakdown: statusStats.reduce((acc, item) => {
                acc[item.status.toLowerCase().replace('_', '-')] = item._count.status;
                return acc;
            }, {}),
            priorityBreakdown: priorityStats.reduce((acc, item) => {
                acc[item.priority.toLowerCase()] = item._count.priority;
                return acc;
            }, {}),
            topOwners: topOwners.map(owner => ({
                name: owner.ticket_owner_name,
                count: owner._count.ticket_owner_name
            }))
        };
    } catch (error) {
        console.error('Error in getAgentSupportStats:', error);
        throw error;
    }
};

// Quick update for individual tickets
exports.quickUpdateTicket = async (ticketId, updateData) => {
    try {
        const allowedFields = ['status', 'priority', 'ticket_owner_name'];
        const updateFields = {};

        // Get the current ticket to compare values for activity logging
        const currentTicket = await prisma.ticket.findUnique({
            where: { ticket_id: ticketId }
        });

        if (!currentTicket) {
            throw new Error('Ticket not found');
        }

        // Build update fields and activity logs
        const activities = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined && value !== null) {
                let finalValue = value;
                
                if (key === 'status' || key === 'priority') {
                    finalValue = value.toUpperCase();
                }
                
                updateFields[key] = finalValue;

                // Log activity if value changed
                if (currentTicket[key] !== finalValue) {
                    activities.push({
                        action: `${key.toUpperCase()}_UPDATED`,
                        ticketId: ticketId,
                        oldValue: currentTicket[key]?.toString() || '',
                        newValue: finalValue.toString(),
                        details: `Updated ${key} from "${currentTicket[key] || 'empty'}" to "${finalValue}"`,
                        agentName: updateData.updatedBy || 'System'
                    });
                }
            }
        }

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        updateFields.updated_at = new Date();

        // Update the ticket
        const updatedTicket = await prisma.ticket.update({
            where: { ticket_id: ticketId },
            data: updateFields
        });

        // Log activities
        if (activities.length > 0) {
            await Promise.all(activities.map(activity => this.logAgentActivity(activity)));
        }

        // Enrich the updated ticket with external data
        const enrichedTickets = await this.enrichTicketsWithExternalData([updatedTicket]);
        return enrichedTickets[0];
    } catch (error) {
        console.error('Error in quickUpdateTicket:', error);
        throw error;
    }
};

// Bulk operations
exports.bulkAssignTickets = async (ticketIds, agentName, assignedBy = 'System') => {
    const results = [];
    
    for (const ticketId of ticketIds) {
        try {
            const currentTicket = await prisma.ticket.findUnique({
                where: { ticket_id: ticketId }
            });

            if (!currentTicket) {
                results.push({ ticketId, success: false, error: 'Ticket not found' });
                continue;
            }

            await prisma.ticket.update({
                where: { ticket_id: ticketId },
                data: { 
                    ticket_owner_name: agentName,
                    updated_at: new Date()
                }
            });

            // Log activity
            await this.logAgentActivity({
                agentName: assignedBy,
                action: 'TICKET_ASSIGNED',
                ticketId: ticketId,
                oldValue: currentTicket.ticket_owner_name || '',
                newValue: agentName,
                details: `Assigned ticket to ${agentName}`
            });

            results.push({ ticketId, success: true });
        } catch (error) {
            results.push({ ticketId, success: false, error: error.message });
        }
    }
    
    return {
        totalProcessed: ticketIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

exports.bulkUpdateStatus = async (ticketIds, status, updatedBy = 'System') => {
    const results = [];
    const upperStatus = status.toUpperCase();
    
    for (const ticketId of ticketIds) {
        try {
            const currentTicket = await prisma.ticket.findUnique({
                where: { ticket_id: ticketId }
            });

            if (!currentTicket) {
                results.push({ ticketId, success: false, error: 'Ticket not found' });
                continue;
            }

            await prisma.ticket.update({
                where: { ticket_id: ticketId },
                data: { 
                    status: upperStatus,
                    updated_at: new Date()
                }
            });

            // Log activity
            await this.logAgentActivity({
                agentName: updatedBy,
                action: 'STATUS_UPDATED',
                ticketId: ticketId,
                oldValue: currentTicket.status,
                newValue: upperStatus,
                details: `Updated status to ${status}`
            });

            results.push({ ticketId, success: true });
        } catch (error) {
            results.push({ ticketId, success: false, error: error.message });
        }
    }
    
    return {
        totalProcessed: ticketIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

exports.bulkUpdatePriority = async (ticketIds, priority, updatedBy = 'System') => {
    const results = [];
    const upperPriority = priority.toUpperCase();
    
    for (const ticketId of ticketIds) {
        try {
            const currentTicket = await prisma.ticket.findUnique({
                where: { ticket_id: ticketId }
            });

            if (!currentTicket) {
                results.push({ ticketId, success: false, error: 'Ticket not found' });
                continue;
            }

            await prisma.ticket.update({
                where: { ticket_id: ticketId },
                data: { 
                    priority: upperPriority,
                    updated_at: new Date()
                }
            });

            // Log activity
            await this.logAgentActivity({
                agentName: updatedBy,
                action: 'PRIORITY_UPDATED',
                ticketId: ticketId,
                oldValue: currentTicket.priority,
                newValue: upperPriority,
                details: `Updated priority to ${priority}`
            });

            results.push({ ticketId, success: true });
        } catch (error) {
            results.push({ ticketId, success: false, error: error.message });
        }
    }
    
    return {
        totalProcessed: ticketIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

exports.bulkDeleteTickets = async (ticketIds, deletedBy = 'System') => {
    const results = [];
    
    for (const ticketId of ticketIds) {
        try {
            const currentTicket = await prisma.ticket.findUnique({
                where: { ticket_id: ticketId }
            });

            if (!currentTicket) {
                results.push({ ticketId, success: false, error: 'Ticket not found' });
                continue;
            }

            await prisma.ticket.delete({
                where: { ticket_id: ticketId }
            });

            // Log activity
            await this.logAgentActivity({
                agentName: deletedBy,
                action: 'TICKET_DELETED',
                ticketId: ticketId,
                details: `Deleted ticket ${ticketId}`
            });

            results.push({ ticketId, success: true });
        } catch (error) {
            results.push({ ticketId, success: false, error: error.message });
        }
    }
    
    return {
        totalProcessed: ticketIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

// Activity logging
exports.logAgentActivity = async (activityData) => {
    try {
        const activity = await prisma.agentActivity.create({
            data: {
                agentName: activityData.agentName,
                action: activityData.action,
                ticketId: activityData.ticketId || null,
                details: activityData.details || null,
                oldValue: activityData.oldValue || null,
                newValue: activityData.newValue || null,
                timestamp: new Date()
            }
        });

        return activity;
    } catch (error) {
        console.error('Error logging agent activity:', error);
        throw error;
    }
};

exports.getAgentActivities = async (agentName, limit = 50, offset = 0) => {
    try {
        const activities = await prisma.agentActivity.findMany({
            where: {
                agentName: agentName
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                ticket: {
                    select: {
                        ticket_id: true,
                        subject: true,
                        status: true
                    }
                }
            }
        });

        return activities;
    } catch (error) {
        console.error('Error fetching agent activities:', error);
        throw error;
    }
};

// Agent configuration management
exports.getAgentConfig = async (agentName) => {
    try {
        const config = await prisma.agentSupportConfig.findUnique({
            where: {
                agentName: agentName
            }
        });

        // Return default config if none exists
        if (!config) {
            return {
                agentName,
                autoAssignEnabled: false,
                maxTicketsPerAgent: 50,
                notificationEnabled: true,
                preferredPriorities: [],
                workingHours: null
            };
        }

        return config;
    } catch (error) {
        console.error('Error fetching agent config:', error);
        throw error;
    }
};

exports.createOrUpdateAgentConfig = async (configData) => {
    try {
        const config = await prisma.agentSupportConfig.upsert({
            where: {
                agentName: configData.agentName
            },
            update: {
                autoAssignEnabled: configData.autoAssignEnabled,
                maxTicketsPerAgent: configData.maxTicketsPerAgent,
                notificationEnabled: configData.notificationEnabled,
                preferredPriorities: configData.preferredPriorities,
                workingHours: configData.workingHours,
                updatedAt: new Date()
            },
            create: {
                agentName: configData.agentName,
                autoAssignEnabled: configData.autoAssignEnabled || false,
                maxTicketsPerAgent: configData.maxTicketsPerAgent || 50,
                notificationEnabled: configData.notificationEnabled !== false,
                preferredPriorities: configData.preferredPriorities || [],
                workingHours: configData.workingHours || null
            }
        });

        return config;
    } catch (error) {
        console.error('Error creating/updating agent config:', error);
        throw error;
    }
};

// Helper Functions

// Build Prisma where clause from filters
exports.buildWhereClause = (filters) => {
    const whereClause = {};

    // Search functionality (search by ticket ID, subject, or description)
    if (filters.search && filters.search.trim() !== '') {
        whereClause.OR = [
            { ticket_id: { contains: filters.search, mode: 'insensitive' } },
            { subject: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
        // Handle frontend format (kebab-case) to backend format (UPPER_CASE)
        let statusValue = filters.status.toUpperCase();
        if (statusValue === 'TO-BE-PROCESSED') {
            statusValue = 'TO_BE_PROCESSED';
        }
        whereClause.status = statusValue;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
        whereClause.priority = filters.priority.toUpperCase();
    }

    // Owner filter
    if (filters.owner && filters.owner !== 'all') {
        whereClause.ticket_owner_name = filters.owner;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
        whereClause.created_at = {};
        if (filters.dateFrom) {
            whereClause.created_at.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            whereClause.created_at.lte = new Date(filters.dateTo);
        }
    }

    console.log('Built where clause:', JSON.stringify(whereClause, null, 2));
    return whereClause;
};

// Enrich tickets with external data using existing ticket service
exports.enrichTicketsWithExternalData = async (tickets) => {
    try {
        if (!tickets || tickets.length === 0) {
            return [];
        }

        // Use existing ticket service to get enriched data
        const enrichedTickets = await ticketService.getTickets();
        
        // Map our tickets to the enriched data
        return tickets.map(ticket => {
            const enrichedTicket = enrichedTickets.find(et => et.ticket_id === ticket.ticket_id);
            
            if (enrichedTicket) {
                // Return the enriched ticket data
                return enrichedTicket;
            } else {
                // Return original ticket with basic fallback data
                return {
                    ...ticket,
                    primary_contact_name: ticket.primary_contact_id ? `Contact ${ticket.primary_contact_id}` : '-',
                    account_display_name: ticket.account_name || '-'
                };
            }
        });
    } catch (error) {
        console.error('Error enriching tickets data:', error);
        // Return original tickets if enrichment fails
        return tickets.map(ticket => ({
            ...ticket,
            primary_contact_name: ticket.primary_contact_id ? `Contact ${ticket.primary_contact_id}` : '-',
            account_display_name: ticket.account_name || '-'
        }));
    }
};
