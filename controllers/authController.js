const authService = require("../services/authService");
const homeByRole = require("../utils/homeByRole");
const ServiceError = require("../utils/ServiceError");

// Ejecuta la acción; ante un ServiceError muestra el mensaje y vuelve a `backTo`
const handle = (backTo, fn) => async (req, res, next) => {
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

// ---------- Registro y activación ----------
exports.getRegisterUser = (req, res) => {
  res.render("auth/register-user", { title: "Registro" });
};

exports.getRegisterCommerce = handle("/login", async (req, res) => {
  res.render("auth/register-commerce", {
    title: "Registro de comercio",
    types: await authService.getCommerceTypes(),
  });
});

exports.postRegisterUser = handle("/register", async (req, res) => {
  await authService.registerUser(req.body, req.file);
  req.flash("success", "Cuenta creada. Revisa tu correo para activarla.");
  res.redirect("/login");
});

exports.postRegisterCommerce = handle("/register-commerce", async (req, res) => {
  await authService.registerCommerce(req.body, req.file);
  req.flash("success", "Comercio registrado. Revisa tu correo para activar la cuenta.");
  res.redirect("/login");
});

exports.getActivate = handle("/login", async (req, res) => {
  const ok = await authService.activate(req.params.token);
  if (ok) req.flash("success", "Cuenta activada. Ya puedes iniciar sesión.");
  else req.flash("errors", "El enlace de activación no es válido o ya fue usado");
  res.redirect("/login");
});

// ---------- Login / logout ----------
exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Iniciar sesión" });
};

exports.postLogin = handle("/login", async (req, res) => {
  const user = await authService.authenticate(req.body.identifier, req.body.password);
  req.session.user = { _id: user._id, role: user.role };
  req.session.save(() => res.redirect(homeByRole(user.role)));
});

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};

// ---------- Reset de contraseña ----------
exports.getForgot = (req, res) => {
  res.render("auth/forgot", { title: "Restablecer contraseña" });
};

exports.postForgot = handle("/forgot-password", async (req, res) => {
  await authService.requestPasswordReset(req.body.identifier);
  req.flash("success", "Si el usuario existe, te enviamos un correo con el enlace.");
  res.redirect("/login");
});

exports.getReset = handle("/login", async (req, res) => {
  if (!(await authService.isResetTokenValid(req.params.token))) {
    req.flash("errors", "El enlace no es válido o ya expiró");
    return res.redirect("/login");
  }
  res.render("auth/reset", { title: "Nueva contraseña", token: req.params.token });
});

exports.postReset = handle("/login", async (req, res) => {
  const ok = await authService.resetPassword(req.params.token, req.body.password);
  if (ok) req.flash("success", "Contraseña actualizada. Ya puedes iniciar sesión.");
  else req.flash("errors", "El enlace no es válido o ya expiró");
  res.redirect("/login");
});