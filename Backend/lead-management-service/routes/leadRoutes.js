const express = require("express");
const leadController = require("../controllers/leadController");
const upload = require("../middlewares/upload");
const { validateCreateLead } = require("../middlewares/validateCreateLead");
const { validateUpdateLead } = require("../middlewares/validateUpdateLead");

const router = express.Router();

// @route   POST /lm/api/leads
router.post("/", upload.single("leadImage"), validateCreateLead, leadController.createLead);

// @route   POST /lm/api/leads/:id/convert
router.post("/:id/convert", leadController.convertLead);

// @route   POST /lm/api/leads/:id/attachments
router.post("/:id/attachments", upload.array("files", 10), leadController.uploadLeadAttachments);

// @route   GET /lm/api/leads
router.get("/", leadController.getAllLeads);

// @route   GET /lm/api/leads/paginate
router.get("/paginate", leadController.getAllLeadsPaginated);

// @route   GET /lm/api/leads/next-leadid
router.get("/next-leadid", leadController.getNextLeadId);

// @route   GET /lm/api/leads/export
router.get("/export", leadController.getLeadsExportedInCsv);

// @route   GET /lm/api/leads/
router.get("/:id", leadController.getLeadById);

// @route   PATCH /lm/api/leads/
router.patch("/:id", upload.single("leadImage"), validateUpdateLead, leadController.updateLead);

// @route   DELETE /lm/api/leads/
router.delete("/:id", leadController.deleteLead);

// @route   DELETE /lm/api/leads/:leadId/attachments/:attachmentId
router.delete("/:leadId/attachments/:attachmentId", leadController.deleteLeadAttachment);

module.exports = router;
