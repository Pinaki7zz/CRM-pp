const express = require('express');
const ServiceTeamManagerController = require('../controllers/serviceTeamManagerController');

const router = express.Router();

router.post('/', ServiceTeamManagerController.createServiceTeamManager);
router.get('/', ServiceTeamManagerController.getAllServiceTeamManagers);
router.get('/:id', ServiceTeamManagerController.getServiceTeamManagerById);
router.put('/:id', ServiceTeamManagerController.updateServiceTeamManager);
router.delete('/:id', ServiceTeamManagerController.deleteServiceTeamManager);

module.exports = router;