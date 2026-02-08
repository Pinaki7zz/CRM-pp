const express = require('express');
const MarketingTeamManagerController = require('../controllers/marketingTeamManagerController');

const router = express.Router();

router.post('/', MarketingTeamManagerController.createMarketingTeamManager);
router.get('/', MarketingTeamManagerController.getAllMarketingTeamManagers);
router.get('/:id', MarketingTeamManagerController.getMarketingTeamManagerById);
router.put('/:id', MarketingTeamManagerController.updateMarketingTeamManager);
router.delete('/:id', MarketingTeamManagerController.deleteMarketingTeamManager);

module.exports = router;