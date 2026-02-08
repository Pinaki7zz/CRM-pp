const express = require("express");
const opportunityController = require("../controllers/opportunityController");
const upload = require("../middlewares/upload");
const { validateCreateOpportunity } = require("../middlewares/validateCreateOpportunity");
const { validateUpdateOpportunity } = require("../middlewares/validateUpdateOpportunity");

const router = express.Router();

// @route   POST /sm/api/opportunity/
router.post("/", validateCreateOpportunity, opportunityController.createOpportunity);

// @route   POST /sm/api/opportunity/:id/attachments
router.post("/:id/attachments", upload.array("files", 10), opportunityController.uploadOpportunityAttachments);

// @route   POST /sm/api/opportunity/:id/notes
router.post("/:id/notes", opportunityController.addOpportunityNote);

// @route   GET /sm/api/opportunity/
router.get("/", opportunityController.getAllOpportunities);

// @route   GET /sm/api/opportunity/paginate
router.get("/paginate", opportunityController.getAllOpportunitiesPaginated);

// @route   GET /sm/api/opportunity/ids-names
router.get("/ids-names", opportunityController.getAllOpportunityIdsNames);

// @route   GET /sm/api/opportunity/export
router.get("/export", opportunityController.getOpportunitiesExportedInCsv);

// @route   GET /sm/api/opportunity/:id
router.get("/:id", opportunityController.getOpportunityById);

// @route   PATCH /sm/api/opportunity/:id
router.patch("/:id", validateUpdateOpportunity, opportunityController.updateOpportunity);

// @route   DELETE /sm/api/opportunity/:id
router.delete("/:id", opportunityController.deleteOpportunity);

// @route   DELETE /sm/api/opportunity/:oppId/attachments/:attachmentId
router.delete("/:oppId/attachments/:attachmentId", opportunityController.deleteOpportunityAttachment);

// @route   DELETE /sm/api/opportunity/:id/notes/:noteId
router.delete("/:id/notes/:noteId", opportunityController.deleteOpportunityNote);

module.exports = router;