const express = require('express');
const ServiceTeamController = require('../controllers/serviceTeamController');

const router = express.Router();

router.post('/', ServiceTeamController.createServiceTeam);
router.get('/', ServiceTeamController.getAllServiceTeams);
router.get('/:id', ServiceTeamController.getServiceTeamById);
router.put('/:id', ServiceTeamController.updateServiceTeam);
router.delete('/:id', ServiceTeamController.deleteServiceTeam);

module.exports = router;