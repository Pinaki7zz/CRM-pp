const express = require('express');
const router = express.Router();
const addPrincipalController = require('../controllers/addPrincipalController');
const authMiddleware = require('../middleware/auth');

// router.use(authMiddleware);

router.post('/', addPrincipalController.createAddPrincipal);
router.get('/', addPrincipalController.getAddPrincipals);
router.get('/:id', addPrincipalController.getAddPrincipal);
router.put('/:id', addPrincipalController.updateAddPrincipal);
router.delete('/:id', addPrincipalController.deleteAddPrincipal);

module.exports = router;