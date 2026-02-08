const express = require('express');
const MarketingTeamEmployeeController = require('../controllers/marketingTeamEmployeeController');

const router = express.Router();

router.post('/', MarketingTeamEmployeeController.createMarketingTeamEmployee);
router.get('/', MarketingTeamEmployeeController.getAllMarketingTeamEmployees);
router.get('/:id', MarketingTeamEmployeeController.getMarketingTeamEmployeeById);
router.put('/:id', MarketingTeamEmployeeController.updateMarketingTeamEmployee);
router.delete('/:id', MarketingTeamEmployeeController.deleteMarketingTeamEmployee);

module.exports = router;