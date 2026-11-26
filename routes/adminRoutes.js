const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");
const adminController = require("../controllers/adminController");

router.use(isAuth, hasRole("admin"));

router.get("/", adminController.getDashboard);

module.exports = router;