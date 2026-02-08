const express = require('express');
const SalesChannelController = require('../controllers/salesChannelController');

const router = express.Router();

router.post('/', SalesChannelController.createSalesChannel);
router.get('/', SalesChannelController.getAllSalesChannels);
router.get('/:salesChannelCode', SalesChannelController.getSalesChannelById);
router.put('/:salesChannelCode', SalesChannelController.updateSalesChannelById);
router.delete('/:salesChannelCode', SalesChannelController.deleteSalesChannelById);

module.exports = router;