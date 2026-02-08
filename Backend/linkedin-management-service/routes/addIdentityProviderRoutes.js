const express = require('express');
const router = express.Router();
const addIdentityProviderController = require('../controllers/addIdentityProviderController');

// Public access - No authentication
router.post('/', addIdentityProviderController.createAddIdentityProvider);
router.get('/', addIdentityProviderController.getAddIdentityProviders);
router.get('/:id', addIdentityProviderController.getAddIdentityProvider);
router.put('/:id', addIdentityProviderController.updateAddIdentityProvider);
router.delete('/:id', addIdentityProviderController.deleteAddIdentityProvider);

module.exports = router;