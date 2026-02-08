const express = require("express");
const salesQuoteController = require("../controllers/salesQuoteController");
const upload = require("../middlewares/upload");
const { validateCreateSalesQuote } = require("../middlewares/validateCreateSalesQuote");
const { validateUpdateSalesQuote } = require("../middlewares/validateUpdateSalesQuote");

const router = express.Router();

// @route   POST /sm/api/sales-quote
router.post("/", validateCreateSalesQuote, salesQuoteController.createSalesQuote);

// @route   POST /sm/api/sales-quote/:id/convert
router.post("/:id/convert", salesQuoteController.convertSalesQuote);

// @route   POST /sm/api/sales-quote/:id/attachments
router.post("/:id/attachments", upload.array("files", 10), salesQuoteController.uploadSalesQuoteAttachments);

// @route   POST /sm/api/sales-quote/:id/notes
router.post("/:id/notes", salesQuoteController.addSalesQuoteNote);

// @route   GET /sm/api/sales-quote
router.get("/", salesQuoteController.getAllSalesQuotes);

// @route   GET /sm/api/sales-quote/paginate
router.get("/paginate", salesQuoteController.getAllSalesQuotesPaginated);

// @route   GET /sm/api/sales-quote/next-quoteid/
router.get("/next-quoteid", salesQuoteController.getNextQuoteId);

// @route   GET /sm/api/sales-quote/export
router.get("/export", salesQuoteController.getSalesQuotesExportedInCsv);

// @route   GET /sm/api/sales-quote/:id/pdf
router.get("/:id/pdf", salesQuoteController.generateSalesQuotePdf);

// @route   GET /sm/api/sales-quote/:id
router.get("/:id", salesQuoteController.getSalesQuoteById);

// @route   PATCH /sm/api/sales-quote/:id
router.patch("/:id", validateUpdateSalesQuote, salesQuoteController.updateSalesQuote);

// @route   DELETE /sm/api/sales-quote/:id
router.delete("/:id", salesQuoteController.deleteSalesQuote);

// @route   DELETE /sm/api/sales-quote/:sqId/attachments/:attachmentId
router.delete("/:sqId/attachments/:attachmentId", salesQuoteController.deleteSalesQuoteAttachment);

// @route   DELETE /sm/api/sales-quote/:id/notes/:noteId
router.delete("/:id/notes/:noteId", salesQuoteController.deleteSalesQuoteNote);

module.exports = router;