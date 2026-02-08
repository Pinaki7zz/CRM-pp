const express = require('express');
const ServiceOfficeController = require('../controllers/serviceOfficeController');

const router = express.Router();

router.post('/', ServiceOfficeController.createServiceOffice);
router.get('/', ServiceOfficeController.getAllServiceOffices);
router.get('/:code', ServiceOfficeController.getServiceOfficeByCode);
router.put('/:code', ServiceOfficeController.updateServiceOffice);
router.delete('/:code', ServiceOfficeController.deleteServiceOffice);

router.post('/:code/assignment', ServiceOfficeController.assignTeamPerson);
router.put('/:code/assignment', ServiceOfficeController.updateTeamPerson);
router.get('/:code/assignment', ServiceOfficeController.getTeamPersonsByOfficeCode);
router.get('/assignments', ServiceOfficeController.getAllAssignments);
router.delete('/:code/assignment', ServiceOfficeController.deleteTeamPersonPair);

module.exports = router;