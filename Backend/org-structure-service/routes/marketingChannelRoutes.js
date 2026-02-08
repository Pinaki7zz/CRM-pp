const express = require('express');
const MarketingChannelController = require('../controllers/marketingChannelController');

const router = express.Router();

router.post('/', MarketingChannelController.createMarketingChannel);
router.get('/', MarketingChannelController.getAllMarketingChannels);
router.get('/:marketingChannelCode', MarketingChannelController.getMarketingChannelById);
router.put('/:marketingChannelCode', MarketingChannelController.updateMarketingChannelById);
router.delete('/:marketingChannelCode', MarketingChannelController.deleteMarketingChannelById);

module.exports = router;