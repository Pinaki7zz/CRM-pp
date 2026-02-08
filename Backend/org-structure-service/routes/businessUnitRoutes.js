const express = require('express');
const BusinessUnitController = require('../controllers/businessUnitController');

const router = express.Router();

router.post('/', BusinessUnitController.createBusinessUnit);
router.put('/:code', BusinessUnitController.updateBusinessUnitByCode);
router.get('/:code', BusinessUnitController.getBusinessUnitByCode);
router.get('/', BusinessUnitController.getAllBusinessUnits);
router.delete('/:code', BusinessUnitController.deleteBusinessUnitByCode);

router.post('/:code/assignment', BusinessUnitController.assignChannelOffice);
router.put('/:code/assignment', BusinessUnitController.updateChannelOffice);
router.get('/:code/assignment', BusinessUnitController.getChannelOfficesByUnitCode);
router.delete('/:code/assignment', BusinessUnitController.deleteChannelOfficePair);

module.exports = router;