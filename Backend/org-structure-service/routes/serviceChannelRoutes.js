const express = require('express');
const ServiceChannelController = require('../controllers/serviceChannelController');

const router = express.Router();

router.post('/', ServiceChannelController.createServiceChannel);
router.get('/', ServiceChannelController.getAllServiceChannels);
router.get('/:serviceChannelCode', ServiceChannelController.getServiceChannelById);
router.put('/:serviceChannelCode', ServiceChannelController.updateServiceChannelById);
router.delete('/:serviceChannelCode', ServiceChannelController.deleteServiceChannelById);

module.exports = router;