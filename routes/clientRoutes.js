const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const clientController = require("../controllers/clientController");
const validate = require("../middlewares/validate");
const {
  addressRules,
  checkoutRules,
  profileRules,
} = require("../middlewares/validators/clientValidators");
const { uploadUser } = require("../config/multer");

router.use(isAuth, hasRole("client"));

router.get("/", clientController.getHome);
router.get("/types/:typeId", clientController.getCommerces);
router.post("/favorites/:commerceId/toggle", clientController.postToggleFavorite);

// Direcciones
router.get("/addresses", clientController.listAddresses);
router.get("/addresses/create", clientController.getCreateAddress);
router.post(
  "/addresses/create",
  addressRules,
  validate("/client/addresses/create"),
  clientController.postCreateAddress
);
router.get("/addresses/:id/edit", clientController.getEditAddress);
router.post(
  "/addresses/:id/edit",
  addressRules,
  validate((req) => `/client/addresses/${req.params.id}/edit`),
  clientController.postEditAddress
);
router.get("/addresses/:id/delete", clientController.getDeleteAddress);
router.post("/addresses/:id/delete", clientController.postDeleteAddress);

// Catálogo, carrito y pedido
router.get("/commerces/:commerceId", clientController.getCatalog);
router.post("/cart/add/:productId", clientController.postAddToCart);
router.post("/cart/remove/:productId", clientController.postRemoveFromCart);
router.get("/checkout", clientController.getCheckout);
router.post("/checkout", checkoutRules, validate("/client/checkout"), clientController.postCheckout);

// Perfil
router.get("/profile", clientController.getProfile);
router.post(
  "/profile",
  uploadUser.single("photo"),
  profileRules,
  validate("/client/profile"),
  clientController.postProfile
);

// Pedidos
router.get("/orders", clientController.listOrders);
router.get("/orders/:id", clientController.getOrder);

// Favoritos
router.get("/favorites", clientController.listFavorites);
router.post("/favorites/:commerceId/remove", clientController.postRemoveFavorite);

module.exports = router;