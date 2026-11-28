const { body } = require("express-validator");

exports.addressRules = [
  body("name").trim().notEmpty().withMessage("El nombre de la dirección es requerido"),
  body("description").trim().notEmpty().withMessage("La descripción es requerida"),
];

exports.checkoutRules = [
  body("addressId").isMongoId().withMessage("Debes seleccionar una dirección"),
];

exports.profileRules = [
  body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
  body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
  body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
];