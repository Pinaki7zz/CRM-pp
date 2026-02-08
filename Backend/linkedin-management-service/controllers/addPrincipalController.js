const addPrincipalService = require('../services/addPrincipalService');
const { principalSchema } = require('../validations/addPrincipalValidation');

exports.createAddPrincipal = async (req, res) => {
  try {
    const { error, value } = principalSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // ✅ REMOVED: No longer validate externalBodyId/integrationId since no relations
    // Just create the principal as standalone entity
    const addPrincipal = await addPrincipalService.createAddPrincipal(value);
    res.status(201).json({ 
      message: 'Principal created successfully (Status: NOT_CONFIGURED)',
      principalId: addPrincipal.id,
      addPrincipal 
    });
  } catch (error) {
    console.error('AddPrincipal creation error:', error);
    res.status(500).json({ error: 'Failed to create Principal' });
  }
};

exports.getAddPrincipals = async (req, res) => {
  try {
    const addPrincipals = await addPrincipalService.getAddPrincipals();
    res.json({ 
      message: 'Principals retrieved successfully',
      count: addPrincipals.length,
      addPrincipals 
    });
  } catch (error) {
    console.error('Get AddPrincipals error:', error);
    res.status(500).json({ error: 'Failed to fetch Principals' });
  }
};

exports.getAddPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const addPrincipal = await addPrincipalService.getAddPrincipal(parseInt(id));
    if (!addPrincipal) return res.status(404).json({ error: 'Principal not found' });
    
    res.json({ 
      message: 'Principal retrieved successfully',
      addPrincipal 
    });
  } catch (error) {
    console.error('Get AddPrincipal error:', error);
    res.status(500).json({ error: 'Failed to fetch Principal' });
  }
};

exports.updateAddPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = principalSchema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Only allow status and scope updates
    const updateData = {};
    if (value.status) updateData.status = value.status;
    if (value.scope !== undefined) updateData.scope = value.scope;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update (status or scope)' });
    }

    const addPrincipal = await addPrincipalService.updateAddPrincipal(parseInt(id), updateData);
    res.json({ 
      message: 'Principal updated successfully',
      addPrincipal 
    });
  } catch (error) {
    console.error('Update AddPrincipal error:', error);
    res.status(500).json({ error: 'Failed to update Principal' });
  }
};

exports.deleteAddPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    await addPrincipalService.deleteAddPrincipal(parseInt(id));
    res.json({ message: 'Principal deleted successfully' });
  } catch (error) {
    console.error('Delete AddPrincipal error:', error);
    res.status(500).json({ error: 'Failed to delete Principal' });
  }
};