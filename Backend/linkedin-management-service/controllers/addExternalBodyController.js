const addExternalBodyService = require('../services/addExternalBodyService');
const { externalBodySchema } = require('../validations/addExternalBodyValidation');

exports.createAddExternalBody = async (req, res) => {
  try {
    const { error, value } = externalBodySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Validate identityProvider exists
    const identityProviderExists = await addExternalBodyService.validateIdentityProvider(value.identityProvider);
    if (!identityProviderExists) {
      return res.status(400).json({ error: `Identity Provider "${value.identityProvider}" not found` });
    }

    const addExternalBody = await addExternalBodyService.createAddExternalBody(value);
    res.status(201).json({ 
      message: 'External Body created successfully',
      externalBodyId: addExternalBody.id,
      addExternalBody 
    });
  } catch (error) {
    console.error('AddExternalBody creation error:', error);
    res.status(500).json({ error: 'Failed to create External Body' });
  }
};

exports.getAddExternalBodies = async (req, res) => {
  try {
    const addExternalBodies = await addExternalBodyService.getAddExternalBodies();
    res.json({ 
      message: 'External Bodies retrieved successfully',
      count: addExternalBodies.length,
      addExternalBodies 
    });
  } catch (error) {
    console.error('Get AddExternalBodies error:', error);
    res.status(500).json({ error: 'Failed to fetch External Bodies' });
  }
};

exports.getAddExternalBody = async (req, res) => {
  try {
    const { id } = req.params;
    const addExternalBody = await addExternalBodyService.getAddExternalBody(parseInt(id));
    if (!addExternalBody) return res.status(404).json({ error: 'External Body not found' });
    
    res.json({ 
      message: 'External Body retrieved successfully',
      addExternalBody 
    });
  } catch (error) {
    console.error('Get AddExternalBody error:', error);
    res.status(500).json({ error: 'Failed to fetch External Body' });
  }
};

exports.updateAddExternalBody = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = externalBodySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Validate identityProvider exists
    const identityProviderExists = await addExternalBodyService.validateIdentityProvider(value.identityProvider);
    if (!identityProviderExists) {
      return res.status(400).json({ error: `Identity Provider "${value.identityProvider}" not found` });
    }

    const addExternalBody = await addExternalBodyService.updateAddExternalBody(parseInt(id), value);
    res.json({ 
      message: 'External Body updated successfully',
      addExternalBody 
    });
  } catch (error) {
    console.error('Update AddExternalBody error:', error);
    res.status(500).json({ error: 'Failed to update External Body' });
  }
};

exports.deleteAddExternalBody = async (req, res) => {
  try {
    const { id } = req.params;
    const addExternalBody = await addExternalBodyService.getAddExternalBody(parseInt(id));
    if (!addExternalBody) return res.status(404).json({ error: 'External Body not found' });

    // Check if referenced by AddPrincipal
    const principalCount = await prisma.addPrincipal.count({
      where: { externalBodyId: parseInt(id) }
    });

    if (principalCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete External Body referenced by Principal(s)',
        referencedPrincipals: principalCount 
      });
    }

    await addExternalBodyService.deleteAddExternalBody(parseInt(id));
    res.json({ message: 'External Body deleted successfully' });
  } catch (error) {
    console.error('Delete AddExternalBody error:', error);
    res.status(500).json({ error: 'Failed to delete External Body' });
  }
};