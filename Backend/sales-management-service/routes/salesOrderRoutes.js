const express = require("express");
const salesOrderController = require("../controllers/salesOrderController");
const upload = require("../middlewares/upload");
const { validateCreateSalesOrder } = require("../middlewares/validateCreateSalesOrder");
const { validateUpdateSalesOrder } = require("../middlewares/validateUpdateSalesOrder");

const router = express.Router();

// @route   POST /sm/api/sales-order/
router.post("/", validateCreateSalesOrder, salesOrderController.createSalesOrder);

// @route   POST /sm/api/sales-order/:id/attachments
router.post("/:id/attachments", upload.array("files", 10), salesOrderController.uploadSalesOrderAttachments);

// @route   POST /sm/api/sales-order/:id/notes
router.post("/:id/notes", salesOrderController.addSalesOrderNote);

// @route   GET /sm/api/sales-order/
router.get("/", salesOrderController.getAllSalesOrders);

// @route   GET /sm/api/sales-order/paginate
router.get("/paginate", salesOrderController.getAllSalesOrdersPaginated);

// @route   GET /sm/api/sales-order/next-orderid/
router.get("/next-orderid", salesOrderController.getNextOrderId);

// @route   GET /sm/api/sales-order/export
router.get("/export", salesOrderController.getSalesOrdersExportedInCsv);

// @route   GET /sm/api/sales-order/:id
router.get("/:id", salesOrderController.getSalesOrderById);

// @route   PATCH /sm/api/sales-order/:id
router.patch("/:id", validateUpdateSalesOrder, salesOrderController.updateSalesOrder);

// @route   DELETE /sm/api/sales-order/:id
router.delete("/:id", salesOrderController.deleteSalesOrder);

// @route   DELETE /sm/api/sales-order/:soId/attachments/:attachmentId
router.delete("/:soId/attachments/:attachmentId", salesOrderController.deleteSalesOrderAttachment);

// @route   DELETE /sm/api/sales-order/:id/notes/:noteId
router.delete("/:id/notes/:noteId", salesOrderController.deleteSalesOrderNote);

module.exports = router;