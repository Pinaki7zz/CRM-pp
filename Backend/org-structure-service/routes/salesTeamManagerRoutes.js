const express = require('express');
const SalesTeamManagerController = require('../controllers/salesTeamManagerController');

const router = express.Router();

router.post('/', SalesTeamManagerController.createSalesTeamManager);
router.get('/', SalesTeamManagerController.getAllSalesTeamManagers);
router.get('/:id', SalesTeamManagerController.getSalesTeamManagerById);
router.put('/:id', SalesTeamManagerController.updateSalesTeamManager);
router.delete('/:id', SalesTeamManagerController.deleteSalesTeamManager);

module.exports = router;