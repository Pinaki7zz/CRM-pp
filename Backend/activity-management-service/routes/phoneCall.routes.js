const express = require('express');
const router = express.Router();
const phoneCallController = require('../controllers/phoneCall.controller');

// Simple test route
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Phone calls API is working!' 
    });
});

// Main routes
router.get('/', phoneCallController.getAllPhoneCalls);
router.get('/:id', phoneCallController.getPhoneCallById);
router.post('/', phoneCallController.createPhoneCall);
router.put('/:id', phoneCallController.updatePhoneCall);
router.delete('/:id', phoneCallController.deletePhoneCall);
router.patch('/:id/status', phoneCallController.updatePhoneCallStatus);

module.exports = router;
