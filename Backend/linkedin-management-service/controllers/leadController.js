const leadService = require('../services/leadService');

exports.generateLeads = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`Generating leads for user ${userId}: "${query}" (limit: ${limit})`);

    // Check if LinkedIn integration exists and user has access token
    const hasLinkedInAccess = await leadService.validateLinkedInAccess(userId);
    if (!hasLinkedInAccess) {
      return res.status(400).json({ 
        error: 'LinkedIn integration not configured or no access token. Complete LinkedIn login first.' 
      });
    }

    const leads = await leadService.fetchAndStoreLeads(userId, query, parseInt(limit));
    
    res.json({ 
      message: 'Leads generated successfully', 
      count: leads.length,
      leads 
    });
  } catch (error) {
    console.error('Lead generation error:', error);
    res.status(500).json({ error: 'Failed to generate leads', details: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const leads = await leadService.getUserLeads(userId);
    
    res.json({ 
      message: 'Leads retrieved successfully',
      count: leads.length,
      leads 
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};