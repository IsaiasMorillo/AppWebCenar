const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const isGuest = require("../middlewares/isGuest");
const validate = require("../middlewares/validate");
const { uploadUser, uploadLogo } = require("../config/multer");
const {
  registerUserRules,
  registerCommerceRules,
  loginRules,
  forgotRules,
  resetRules,
} = require("../middlewares/validators/authValidators");

router.get("/register", isGuest, authController.getRegisterUser);
router.post(
  "/register",
  isGuest,
  uploadUser.single("photo"),
  registerUserRules,
  validate("/register"),
  authController.postRegisterUser
);

router.get("/register-commerce", isGuest, authController.getRegisterCommerce);
router.post(
  "/register-commerce",
  isGuest,
  uploadLogo.single("logo"),
  registerCommerceRules,
  validate("/register-commerce"),
  authController.postRegisterCommerce
);

router.get("/activate/:token", authController.getActivate);

router.get("/login", isGuest, authController.getLogin);
router.post("/login", isGuest, loginRules, validate("/login"), authController.postLogin);
router.post("/logout", authController.logout);

router.get("/forgot-password", isGuest, authController.getForgot);
router.post(
  "/forgot-password",
  isGuest,
  forgotRules,
  validate("/forgot-password"),
  authController.postForgot
);

router.get("/reset-password/:token", authController.getReset);
router.post(
  "/reset-password/:token",
  resetRules,
  validate((req) => `/reset-password/${req.params.token}`),
  authController.postReset
);

module.exports = router;