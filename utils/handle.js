const ServiceError = require("./ServiceError");

// Ejecuta la acción; ante un ServiceError muestra el mensaje y redirige a `backTo`
module.exports = (backTo, fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof ServiceError) {
      req.flash("errors", error.message);
      return res.redirect(typeof backTo === "function" ? backTo(req) : backTo);
    }
    next(error);
  }
};