// routes/domainRoutes.js
const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

// Route to generate SPF, DKIM, and DMARC records
router.post('/generate', domainController.generateRecords);

// Route to verify SPF, DKIM, and DMARC records
router.post('/verify', domainController.verifyRecords); // Using POST for request body clarity

module.exports = router;