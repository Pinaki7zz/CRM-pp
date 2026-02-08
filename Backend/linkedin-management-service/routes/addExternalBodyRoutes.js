const express = require('express');
const router = express.Router();
const addExternalBodyController = require('../controllers/addExternalBodyController');

// Public access - No authentication
router.post('/', addExternalBodyController.createAddExternalBody);
router.get('/', addExternalBodyController.getAddExternalBodies);
router.get('/:id', addExternalBodyController.getAddExternalBody);
router.put('/:id', addExternalBodyController.updateAddExternalBody);
router.delete('/:id', addExternalBodyController.deleteAddExternalBody);

module.exports = router;