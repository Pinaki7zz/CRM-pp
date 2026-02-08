const express = require('express');
const MarketingTeamController = require('../controllers/marketingTeamController');

const router = express.Router();

router.post('/', MarketingTeamController.createMarketingTeam);
router.get('/', MarketingTeamController.getAllMarketingTeams);
router.get('/:id', MarketingTeamController.getMarketingTeamById);
router.put('/:id', MarketingTeamController.updateMarketingTeam);
router.delete('/:id', MarketingTeamController.deleteMarketingTeam);

module.exports = router;