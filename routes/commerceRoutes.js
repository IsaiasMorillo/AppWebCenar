const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const validate = require("../middlewares/validate");
const { uploadProduct, uploadLogo } = require("../config/multer");
const commerceController = require("../controllers/commerceController");
const {
  profileRules,
  categoryRules,
  createProductRules,
  editProductRules,
} = require("../middlewares/validators/commerceValidators");

router.use(isAuth, hasRole("commerce"));

router.get("/", commerceController.getHome);
router.get("/orders/:id", commerceController.getOrder);
router.post("/orders/:id/assign", commerceController.postAssignDelivery);

// Perfil
router.get("/profile", commerceController.getProfile);
router.post(
  "/profile",
  uploadLogo.single("logo"),
  profileRules,
  validate("/commerce/profile"),
  commerceController.postProfile
);

// Categorías
router.get("/categories", commerceController.listCategories);
router.get("/categories/create", commerceController.getCreateCategory);
router.post(
  "/categories/create",
  categoryRules,
  validate("/commerce/categories/create"),
  commerceController.postCreateCategory
);
router.get("/categories/:id/edit", commerceController.getEditCategory);
router.post(
  "/categories/:id/edit",
  categoryRules,
  validate((req) => `/commerce/categories/${req.params.id}/edit`),
  commerceController.postEditCategory
);
router.get("/categories/:id/delete", commerceController.getDeleteCategory);
router.post("/categories/:id/delete", commerceController.postDeleteCategory);

// Productos
router.get("/products", commerceController.listProducts);
router.get("/products/create", commerceController.getCreateProduct);
router.post(
  "/products/create",
  uploadProduct.single("image"),
  createProductRules,
  validate("/commerce/products/create"),
  commerceController.postCreateProduct
);
router.get("/products/:id/edit", commerceController.getEditProduct);
router.post(
  "/products/:id/edit",
  uploadProduct.single("image"),
  editProductRules,
  validate((req) => `/commerce/products/${req.params.id}/edit`),
  commerceController.postEditProduct
);
router.get("/products/:id/delete", commerceController.getDeleteProduct);
router.post("/products/:id/delete", commerceController.postDeleteProduct);

module.exports = router;