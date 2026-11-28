const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const validate = require("../middlewares/validate");
const { uploadUser } = require("../config/multer");
const deliveryController = require("../controllers/deliveryController");
const { profileRules } = require("../middlewares/validators/clientValidators");

router.use(isAuth, hasRole("delivery"));

router.get("/", deliveryController.getHome);
router.get("/orders/:id", deliveryController.getOrder);
router.post("/orders/:id/complete", deliveryController.postComplete);

router.get("/profile", deliveryController.getProfile);
router.post(
  "/profile",
  uploadUser.single("photo"),
  profileRules,
  validate("/delivery/profile"),
  deliveryController.postProfile
);

module.exports = router;