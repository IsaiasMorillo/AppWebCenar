const { body } = require("express-validator");
const User = require("../../models/User");

const passwordRules = [
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Debe confirmar la contraseña")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Las contraseñas no coinciden"),
];

const uniqueEmail = body("email")
  .trim()
  .notEmpty()
  .withMessage("El correo es requerido")
  .isEmail()
  .withMessage("El correo no es válido")
  .custom(async (value) => {
    const exists = await User.findOne({ email: value.toLowerCase() });
    if (exists) throw new Error("Ya existe un usuario con ese correo");
  });

// Cliente / Delivery
exports.registerUserRules = [
  body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
  body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
  body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
  uniqueEmail,
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es requerido")
    .custom(async (value) => {
      const exists = await User.findOne({ username: value });
      if (exists) throw new Error("Ya existe un usuario con ese nombre de usuario");
    }),
  body("role")
    .isIn(["client", "delivery"])
    .withMessage("Debe seleccionar un rol válido (cliente o delivery)"),
  body("photo").custom((value, { req }) => {
    if (!req.file) throw new Error("La foto de perfil es requerida");
    return true;
  }),
  ...passwordRules,
];

// Comercio
exports.registerCommerceRules = [
  body("commerceName").trim().notEmpty().withMessage("El nombre del comercio es requerido"),
  body("phone").trim().notEmpty().withMessage("El teléfono es requerido"),
  uniqueEmail,
  body("openingTime").notEmpty().withMessage("La hora de apertura es requerida"),
  body("closingTime").notEmpty().withMessage("La hora de cierre es requerida"),
  body("commerceType").isMongoId().withMessage("Debe seleccionar un tipo de comercio"),
  body("logo").custom((value, { req }) => {
    if (!req.file) throw new Error("El logo del comercio es requerido");
    return true;
  }),
  ...passwordRules,
];

exports.loginRules = [
  body("identifier").trim().notEmpty().withMessage("El correo o nombre de usuario es requerido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

exports.forgotRules = [
  body("identifier").trim().notEmpty().withMessage("El correo o nombre de usuario es requerido"),
];

exports.resetRules = [...passwordRules];