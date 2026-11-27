const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const adminController = require("../controllers/adminController");
const validate = require("../middlewares/validate");
const commerceTypeController = require("../controllers/commerceTypeController");
const { uploadIcon } = require("../config/multer");
const {
  configRules,
  createAdminRules,
  editAdminRules,
  createCommerceTypeRules,
  editCommerceTypeRules,
} = require("../middlewares/validators/adminValidators");

router.use(isAuth, hasRole("admin"));

router.get("/", adminController.getDashboard);
router.get("/clients", adminController.listClients);
router.post("/clients/:id/toggle", adminController.toggleClient);

router.get("/deliveries", adminController.listDeliveries);
router.post("/deliveries/:id/toggle", adminController.toggleDelivery);

router.get("/commerces", adminController.listCommerces);
router.post("/commerces/:id/toggle", adminController.toggleCommerce);

// Configuración
router.get("/config", adminController.getConfig);
router.get("/config/edit", adminController.getEditConfig);
router.post("/config/edit", configRules, validate("/admin/config/edit"), adminController.postEditConfig);

// Administradores
router.get("/admins", adminController.listAdmins);
router.get("/admins/create", adminController.getCreateAdmin);
router.post("/admins/create", createAdminRules, validate("/admins/create".replace(/^/, "/admin")), adminController.postCreateAdmin);
router.get("/admins/:id/edit", adminController.getEditAdmin);
router.post(
  "/admins/:id/edit",
  editAdminRules,
  validate((req) => `/admin/admins/${req.params.id}/edit`),
  adminController.postEditAdmin
);
router.post("/admins/:id/toggle", adminController.toggleAdmin);

// Tipos de comercio
router.get("/commerce-types", commerceTypeController.list);
router.get("/commerce-types/create", commerceTypeController.getCreate);
router.post(
  "/commerce-types/create",
  uploadIcon.single("icon"),
  createCommerceTypeRules,
  validate("/admin/commerce-types/create"),
  commerceTypeController.postCreate
);
router.get("/commerce-types/:id/edit", commerceTypeController.getEdit);
router.post(
  "/commerce-types/:id/edit",
  uploadIcon.single("icon"),
  editCommerceTypeRules,
  validate((req) => `/admin/commerce-types/${req.params.id}/edit`),
  commerceTypeController.postEdit
);
router.get("/commerce-types/:id/delete", commerceTypeController.getDelete);
router.post("/commerce-types/:id/delete", commerceTypeController.postDelete);

module.exports = router;