const express = require('express');
const router = express.Router();
const addNamedCredentialController = require('../controllers/addNamedCredentialController');

// Public access - No authentication
router.post('/', addNamedCredentialController.createAddNamedCredential);
router.get('/', addNamedCredentialController.getAddNamedCredentials);
router.get('/:id', addNamedCredentialController.getAddNamedCredential);
router.put('/:id', addNamedCredentialController.updateAddNamedCredential);
router.delete('/:id', addNamedCredentialController.deleteAddNamedCredential);

module.exports = router;