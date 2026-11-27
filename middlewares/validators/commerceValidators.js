const { body } = require("express-validator");
const User = require("../../models/User");

exports.profileRules = [
  body("openingTime").notEmpty().withMessage("La hora de apertura es requerida"),
  body("closingTime").notEmpty().withMessage("La hora de cierre es requerida"),
  body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("El correo no es válido")
    .custom(async (value, { req }) => {
      const exists = await User.findOne({
        email: value.toLowerCase(),
        _id: { $ne: req.session.user._id },
      });
      if (exists) throw new Error("Ya existe un usuario con ese correo");
    }),
];

exports.categoryRules = [
  body("name").trim().notEmpty().withMessage("El nombre es requerido"),
  body("description").trim().notEmpty().withMessage("La descripción es requerida"),
];