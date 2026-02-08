const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');

// Protected - Requires CRM user login
router.use(authMiddleware);

router.post('/generate', leadController.generateLeads);
router.get('/', leadController.getLeads);

module.exports = router;