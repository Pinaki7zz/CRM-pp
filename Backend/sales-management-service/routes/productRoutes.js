const express = require("express");
const productController = require("../controllers/productController");
const upload = require("../middlewares/upload"); // Import the upload middleware

const router = express.Router();

// @route   POST /api/product/
router.post("/", productController.createProduct);

// @route   GET /api/product/
router.get("/", productController.getAllProducts);

// @route   GET /api/product/paginate
router.get("/paginate", productController.getAllProductsPaginated);

// @route   GET /api/product/:id
router.get("/:id", productController.getProductById);

// @route   PATCH /api/product/:id
router.patch("/:id", productController.updateProduct);

// @route   DELETE /api/product/:id
router.delete("/:id", productController.deleteProduct);

// --- Attachment Routes ---

// @route   POST /api/product/:id/attachments
// Handles file upload for a specific product
router.post("/:id/attachments", upload.single("file"), productController.addAttachment);

// @route   GET /api/product/:id/attachments
// Retrieves all attachments for a specific product
router.get("/:id/attachments", productController.getAttachments);

module.exports = router;