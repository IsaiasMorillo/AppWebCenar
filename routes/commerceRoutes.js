const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const validate = require("../middlewares/validate");
const { uploadLogo } = require("../config/multer");
const commerceController = require("../controllers/commerceController");
const { profileRules, categoryRules } = require("../middlewares/validators/commerceValidators");

router.use(isAuth, hasRole("commerce"));

// Home provisional (lo reemplazamos en la parte 3 con el listado de pedidos)
router.get("/", (req, res) => res.render("commerce/home", { title: "Home del comercio" }));

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

module.exports = router;