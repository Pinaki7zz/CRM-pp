const express = require('express');
const router = express.Router();
const webformController = require('../controllers/webformController');
const { 
  createWebformValidator, 
  getWebformValidator, 
  submitWebformValidator,
  updateWebformValidator
} = require('../utils/validators/webformValidator');

// Create a new webform - POST /api/webforms
router.post(
  '/',
  createWebformValidator, 
  webformController.createWebform
);

// Get all webforms - GET /api/webforms
router.get('/', webformController.getAllWebforms);

// Get webform by URL - GET /api/webforms/url/:url
router.get('/url/:url', getWebformValidator, webformController.getWebformByUrl);

// Get webform by ID - GET /api/webforms/:id
router.get('/:id', webformController.getWebformById);

// Update webform - PUT /api/webforms/:id
router.put(
  '/:id', 
  updateWebformValidator, 
  webformController.updateWebform
);

// Delete webform - DELETE /api/webforms/:id
router.delete('/:id', webformController.deleteWebform);

// Get all submissions for a webform - GET /api/webforms/:id/submissions
router.get('/:id/submissions', webformController.getWebformSubmissions);

module.exports = router;
