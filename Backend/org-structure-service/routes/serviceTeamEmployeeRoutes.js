const express = require('express');
const ServiceTeamEmployeeController = require('../controllers/serviceTeamEmployeeController');

const router = express.Router();

router.post('/', ServiceTeamEmployeeController.createServiceTeamEmployee);
router.get('/', ServiceTeamEmployeeController.getAllServiceTeamEmployees);
router.get('/:id', ServiceTeamEmployeeController.getServiceTeamEmployeeById);
router.put('/:id', ServiceTeamEmployeeController.updateServiceTeamEmployee);
router.delete('/:id', ServiceTeamEmployeeController.deleteServiceTeamEmployee);

module.exports = router;