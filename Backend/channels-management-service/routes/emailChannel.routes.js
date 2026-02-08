const express = require('express');
const router = express.Router();
const emailChannelController = require('../controllers/emailChannel.controller');
const { validateEmailChannel, validateEmailChannelUpdate } = require('../utils/validators/emailChannel.validator');

// Email verification routes
router.post('/verify-email', emailChannelController.verifyEmail);

router.get('/confirm/:token', emailChannelController.confirmEmail);

router.get('/verification-status/:email', emailChannelController.getVerificationStatus);

// CRUD routes
router.get('/', emailChannelController.getAllEmailChannels);
router.get('/:id', emailChannelController.getEmailChannelById);
router.post('/', validateEmailChannel, emailChannelController.createEmailChannel);
router.put('/:id', validateEmailChannelUpdate, emailChannelController.updateEmailChannel);
router.delete('/:id', emailChannelController.deleteEmailChannel);

// Channel activation routes
router.post('/:id/activate', emailChannelController.activateEmailChannel);
router.post('/:id/deactivate', emailChannelController.deactivateEmailChannel);

// Testing route
router.post('/unverify-email', emailChannelController.unverifyEmail);

module.exports = router;
