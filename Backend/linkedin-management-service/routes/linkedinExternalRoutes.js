const express = require('express');
const router = express.Router();
const linkedinExternalController = require('../controllers/linkedinExternalController');

// Public access for setup - No authentication
router.post('/', linkedinExternalController.createLinkedinExternal);
router.get('/', linkedinExternalController.getLinkedinExternals);
router.get('/:id', linkedinExternalController.getLinkedinExternal);
router.put('/:id', linkedinExternalController.updateLinkedinExternal);
router.delete('/:id', linkedinExternalController.deleteLinkedinExternal);

// Public LinkedIn login flow (no CRM auth required)
router.get('/:id/login/initiate', linkedinExternalController.initiateLinkedInLogin);
router.get('/:id/login/callback', linkedinExternalController.handleLinkedInCallback);

module.exports = router;