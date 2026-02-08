const express = require("express");
const productCategoryController = require("../controllers/productCategoryController");
const { validateCreateProductCategory } = require("../middlewares/validateCreateProductCategory");
const { validateUpdateProductCategory } = require("../middlewares/validateUpdateProductCategory");

const router = express.Router();

// @route   POST /sm/api/product-category/
router.post("/", validateCreateProductCategory, productCategoryController.createProductCategoryWithSubs);

// @route   GET /sm/api/product-category/
router.get("/", productCategoryController.getAllProductCategories);

// @route   GET /sm/api/product-category/paginate
router.get("/paginate", productCategoryController.getAllProductCategoriesPaginated);

// @route   GET /sm/api/product-category/export
router.get("/export", productCategoryController.getProductCategoriesExportedInCsv);

// @route   GET /sm/api/product-category/:id
router.get("/:id", productCategoryController.getProductCategoryById);

// @route   PATCH /sm/api/product-category/:id
router.patch("/:id", validateUpdateProductCategory, productCategoryController.updateProductCategoryWithSubs);

// @route   DELETE /sm/api/product-category/:id
router.delete("/:id", productCategoryController.deleteProductCategory);

module.exports = router;