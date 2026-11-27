const { body } = require("express-validator");
const User = require("../../models/User");
const CommerceType = require("../../models/CommerceType");

exports.configRules = [
  body("itbis")
    .notEmpty()
    .withMessage("El ITBIS es requerido")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El ITBIS debe ser un número entre 0 y 100"),
];

// Para crear (id = null) y editar (id = _id del admin editado)
const adminBase = (isEdit) => [
  body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
  body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
  body("idCard").trim().notEmpty().withMessage("La cédula es requerida"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("El correo no es válido")
    .custom(async (value, { req }) => {
      const exists = await User.findOne({
        email: value.toLowerCase(),
        _id: { $ne: isEdit ? req.params.id : null },
      });
      if (exists) throw new Error("Ya existe un usuario con ese correo");
    }),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es requerido")
    .custom(async (value, { req }) => {
      const exists = await User.findOne({
        username: value,
        _id: { $ne: isEdit ? req.params.id : null },
      });
      if (exists) throw new Error("Ya existe un usuario con ese nombre de usuario");
    }),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Debe confirmar la contraseña")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Las contraseñas no coinciden"),
];

exports.createAdminRules = adminBase(false);
exports.editAdminRules = adminBase(true);

const commerceTypeBase = (isEdit) => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .custom(async (value, { req }) => {
      const exists = await CommerceType.findOne({
        name: value,
        _id: { $ne: isEdit ? req.params.id : null },
      });
      if (exists) throw new Error("Ya existe un tipo de comercio con ese nombre");
    }),
  body("description").trim().notEmpty().withMessage("La descripción es requerida"),
  body("icon").custom((value, { req }) => {
    if (!isEdit && !req.file) throw new Error("El icono es requerido");
    return true; // en la edición el icono es opcional
  }),
];

exports.createCommerceTypeRules = commerceTypeBase(false);
exports.editCommerceTypeRules = commerceTypeBase(true);