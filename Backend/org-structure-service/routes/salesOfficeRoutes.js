const express = require('express');
const SalesOfficeController = require('../controllers/salesOfficeController');

const router = express.Router();

router.post('/', SalesOfficeController.createSalesOffice);
router.get('/', SalesOfficeController.getAllSalesOffices);
router.get('/:code', SalesOfficeController.getSalesOfficeByCode);
router.put('/:code', SalesOfficeController.updateSalesOffice);
router.delete('/:code', SalesOfficeController.deleteSalesOffice);

router.post('/:code/assignment', SalesOfficeController.assignTeamPerson);
router.put('/:code/assignment', SalesOfficeController.updateTeamPerson);
router.get('/:code/assignment', SalesOfficeController.getTeamPersonsByOfficeCode);
router.get('/assignments', SalesOfficeController.getAllAssignments);
router.delete('/:code/assignment', SalesOfficeController.deleteTeamPersonPair);

module.exports = router;