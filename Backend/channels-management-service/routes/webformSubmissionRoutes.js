const express = require('express');
const router = express.Router();
const webformController = require('../controllers/webformController');
const { submitWebformValidator } = require('../validators/webformValidator');

// Submit webform data - POST /api/lead-form-submissions
router.post(
  '/',
  submitWebformValidator, 
  webformController.submitWebform
);

module.exports = router;
