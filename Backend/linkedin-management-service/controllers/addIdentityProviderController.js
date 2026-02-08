const addIdentityProviderService = require('../services/addIdentityProviderService');
const { identityProviderSchema } = require('../validations/addIdentityProviderValidation');

exports.createAddIdentityProvider = async (req, res) => {
  try {
    const { error, value } = identityProviderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const addIdentityProvider = await addIdentityProviderService.createAddIdentityProvider(value);
    res.status(201).json({ 
      message: 'Identity Provider created successfully',
      identityProviderId: addIdentityProvider.id,
      addIdentityProvider 
    });
  } catch (error) {
    console.error('AddIdentityProvider creation error:', error);
    res.status(500).json({ error: 'Failed to create Identity Provider' });
  }
};

exports.getAddIdentityProviders = async (req, res) => {
  try {
    const addIdentityProviders = await addIdentityProviderService.getAddIdentityProviders();
    res.json({ 
      message: 'Identity Providers retrieved successfully',
      count: addIdentityProviders.length,
      addIdentityProviders 
    });
  } catch (error) {
    console.error('Get AddIdentityProviders error:', error);
    res.status(500).json({ error: 'Failed to fetch Identity Providers' });
  }
};

exports.getAddIdentityProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const addIdentityProvider = await addIdentityProviderService.getAddIdentityProvider(parseInt(id));
    if (!addIdentityProvider) return res.status(404).json({ error: 'Identity Provider not found' });
    
    res.json({ 
      message: 'Identity Provider retrieved successfully',
      addIdentityProvider 
    });
  } catch (error) {
    console.error('Get AddIdentityProvider error:', error);
    res.status(500).json({ error: 'Failed to fetch Identity Provider' });
  }
};

exports.updateAddIdentityProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = identityProviderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const addIdentityProvider = await addIdentityProviderService.updateAddIdentityProvider(parseInt(id), value);
    res.json({ 
      message: 'Identity Provider updated successfully',
      addIdentityProvider 
    });
  } catch (error) {
    console.error('Update AddIdentityProvider error:', error);
    res.status(500).json({ error: 'Failed to update Identity Provider' });
  }
};

exports.deleteAddIdentityProvider = async (req, res) => {
  try {
    const { id } = req.params;
    await addIdentityProviderService.deleteAddIdentityProvider(parseInt(id));
    res.json({ message: 'Identity Provider deleted successfully' });
  } catch (error) {
    console.error('Delete AddIdentityProvider error:', error);
    res.status(500).json({ error: 'Failed to delete Identity Provider' });
  }
};