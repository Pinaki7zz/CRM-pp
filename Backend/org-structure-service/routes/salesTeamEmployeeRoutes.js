const express = require('express');
const SalesTeamEmployeeController = require('../controllers/salesTeamEmployeeController');

const router = express.Router();

router.post('/', SalesTeamEmployeeController.createSalesTeamEmployee);
router.get('/', SalesTeamEmployeeController.getAllSalesTeamEmployees);
router.get('/:id', SalesTeamEmployeeController.getSalesTeamEmployeeById);
router.put('/:id', SalesTeamEmployeeController.updateSalesTeamEmployee);
router.delete('/:id', SalesTeamEmployeeController.deleteSalesTeamEmployee);

module.exports = router;