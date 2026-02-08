const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');

// Public access - No authentication required
router.post('/', integrationController.createIntegration);
router.get('/', integrationController.getIntegrations);
router.get('/:id', integrationController.getIntegration);
router.put('/:id', integrationController.updateIntegration);
router.delete('/:id', integrationController.deleteIntegration);

module.exports = router;