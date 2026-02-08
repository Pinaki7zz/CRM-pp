const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { 
  identityProviderSchema, 
  externalBodySchema, 
  principalSchema, 
  namedCredentialSchema 
} = require('../validations/credentialValidation');
const authMiddleware = require('../middleware/auth');

// Validation middleware helper
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Get schema based on type
const getSchema = (type) => {
  switch (type) {
    case 'identity-provider': return identityProviderSchema;
    case 'external-body': return externalBodySchema;
    case 'principal': return principalSchema;
    case 'named-credential': return namedCredentialSchema;
    default: return null;
  }
};

router.use(authMiddleware);

router.post('/:type', (req, res, next) => {
  const { type } = req.params;
  const schema = getSchema(type);
  if (!schema) return res.status(400).json({ error: 'Invalid credential type' });
  validate(schema)(req, res, next);
}, credentialController.createCredential);

router.get('/:type', credentialController.getCredentials);

router.get('/:type/:id', credentialController.getCredential);

router.put('/:type/:id', (req, res, next) => {
  const { type } = req.params;
  const schema = getSchema(type);
  if (!schema) return res.status(400).json({ error: 'Invalid credential type' });
  validate(schema)(req, res, next);
}, credentialController.updateCredential);

router.delete('/:type/:id', credentialController.deleteCredential);

module.exports = router;