const express = require("express");
const BusinessEntityController = require("../controllers/businessEntityController");

const router = express.Router();

router.post("/", BusinessEntityController.createBusinessEntity);
router.put("/:code", BusinessEntityController.updateBusinessEntityByCode);
router.get("/:code", BusinessEntityController.getBusinessEntityByCode);
router.get("/", BusinessEntityController.getAllBusinessEntities);
router.delete("/:code", BusinessEntityController.deleteBusinessEntityByCode);

router.post("/:code/assignment", BusinessEntityController.assignUnits);
router.put("/:code/assignment", BusinessEntityController.updateUnits);
router.get("/:code/assignment", BusinessEntityController.getUnitsByEntityCode);
router.delete("/:code/assignment", BusinessEntityController.deleteUnitPair);
// router.get("/validate", BusinessEntityController.validatePinCodeController);

module.exports = router;
