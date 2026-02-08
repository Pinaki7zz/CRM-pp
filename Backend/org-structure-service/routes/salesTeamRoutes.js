const express = require('express');
const SalesTeamController = require('../controllers/salesTeamController');

const router = express.Router();

router.post('/', SalesTeamController.createSalesTeam);
router.get('/', SalesTeamController.getAllSalesTeams);
router.get('/:id', SalesTeamController.getSalesTeamById);
router.put('/:id', SalesTeamController.updateSalesTeam);
router.delete('/:id', SalesTeamController.deleteSalesTeam);

module.exports = router;