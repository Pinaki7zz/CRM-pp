const express = require('express');
const MarketingOfficeController = require('../controllers/marketingOfficeController');

const router = express.Router();

router.post('/', MarketingOfficeController.createMarketingOffice);
router.get('/', MarketingOfficeController.getAllMarketingOffices);
router.get('/:code', MarketingOfficeController.getMarketingOfficeByCode);
router.put('/:code', MarketingOfficeController.updateMarketingOffice);
router.delete('/:code', MarketingOfficeController.deleteMarketingOffice);

router.post('/:code/assignment', MarketingOfficeController.assignTeamPerson);
router.put('/:code/assignment', MarketingOfficeController.updateTeamPerson);
router.get('/:code/assignment', MarketingOfficeController.getTeamPersonsByOfficeCode);
router.get('/assignments', MarketingOfficeController.getAllAssignments);
router.delete('/:code/assignment', MarketingOfficeController.deleteTeamPersonPair);

module.exports = router;