const addNamedCredentialService = require('../services/addNamedCredentialService');
const { namedCredentialSchema } = require('../validations/addNamedCredentialValidation');

// exports.createAddNamedCredential = async (req, res) => {
//   try {
//     const { error, value } = namedCredentialSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     // Validate externalCredential exists in AddExternalBody
//     const externalBodyExists = await addNamedCredentialService.validateExternalCredential(value.externalCredential);
//     if (!externalBodyExists) {
//       return res.status(400).json({ 
//         error: `External Credential "${value.externalCredential}" not found in AddExternalBody` 
//       });
//     }

//     const addNamedCredential = await addNamedCredentialService.createAddNamedCredential(value);
//     res.status(201).json({ 
//       message: 'Named Credential created successfully',
//       namedCredentialId: addNamedCredential.id,
//       addNamedCredential 
//     });
//   } catch (error) {
//     console.error('AddNamedCredential creation error:', error);
//     res.status(500).json({ error: 'Failed to create Named Credential' });
//   }
// };


exports.createAddNamedCredential = async (req, res) => {
  try {
    const { error, value } = namedCredentialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // ✅ REMOVED: No longer validate externalCredential exists
    const addNamedCredential = await addNamedCredentialService.createAddNamedCredential(value);
    res.status(201).json({ 
      message: 'Named Credential created successfully',
      namedCredentialId: addNamedCredential.id,
      addNamedCredential 
    });
  } catch (error) {
    console.error('AddNamedCredential creation error:', error);
    res.status(500).json({ error: 'Failed to create Named Credential' });
  }
};

exports.getAddNamedCredentials = async (req, res) => {
  try {
    const addNamedCredentials = await addNamedCredentialService.getAddNamedCredentials();
    res.json({ 
      message: 'Named Credentials retrieved successfully',
      count: addNamedCredentials.length,
      addNamedCredentials 
    });
  } catch (error) {
    console.error('Get AddNamedCredentials error:', error);
    res.status(500).json({ error: 'Failed to fetch Named Credentials' });
  }
};

exports.getAddNamedCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const addNamedCredential = await addNamedCredentialService.getAddNamedCredential(parseInt(id));
    if (!addNamedCredential) return res.status(404).json({ error: 'Named Credential not found' });
    
    res.json({ 
      message: 'Named Credential retrieved successfully',
      addNamedCredential 
    });
  } catch (error) {
    console.error('Get AddNamedCredential error:', error);
    res.status(500).json({ error: 'Failed to fetch Named Credential' });
  }
};

exports.updateAddNamedCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = namedCredentialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Validate externalCredential exists
    const externalBodyExists = await addNamedCredentialService.validateExternalCredential(value.externalCredential);
    if (!externalBodyExists) {
      return res.status(400).json({ 
        error: `External Credential "${value.externalCredential}" not found in AddExternalBody` 
      });
    }

    const addNamedCredential = await addNamedCredentialService.updateAddNamedCredential(parseInt(id), value);
    res.json({ 
      message: 'Named Credential updated successfully',
      addNamedCredential 
    });
  } catch (error) {
    console.error('Update AddNamedCredential error:', error);
    res.status(500).json({ error: 'Failed to update Named Credential' });
  }
};

exports.deleteAddNamedCredential = async (req, res) => {
  try {
    const { id } = req.params;
    await addNamedCredentialService.deleteAddNamedCredential(parseInt(id));
    res.json({ message: 'Named Credential deleted successfully' });
  } catch (error) {
    console.error('Delete AddNamedCredential error:', error);
    res.status(500).json({ error: 'Failed to delete Named Credential' });
  }
};