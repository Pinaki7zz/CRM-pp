const integrationService = require('../services/integrationService');
const { integrationSchema } = require('../validations/integrationValidation');

exports.createIntegration = async (req, res) => {
  try {
    const { error, value } = integrationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const integration = await integrationService.createIntegration(value);
    res.status(201).json({ 
      message: 'LinkedIn integration created successfully',
      integrationId: integration.id,
      integration 
    });
  } catch (error) {
    console.error('Integration creation error:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
};

exports.getIntegrations = async (req, res) => {
  try {
    const integrations = await integrationService.getIntegrations();
    res.json({ 
      message: 'Integrations retrieved successfully',
      count: integrations.length,
      integrations 
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

exports.getIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await integrationService.getIntegration(parseInt(id));
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    
    res.json({ 
      message: 'Integration retrieved successfully',
      integration 
    });
  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
};

exports.updateIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = integrationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const integration = await integrationService.updateIntegration(parseInt(id), value);
    res.json({ 
      message: 'Integration updated successfully',
      integration 
    });
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
};

exports.deleteIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    await integrationService.deleteIntegration(parseInt(id));
    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
};