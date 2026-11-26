const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CommerceType = require("../models/CommerceType");
const { sendActivationEmail, sendResetEmail } = require("../services/emailService");
const homeByRole = require("../utils/homeByRole");

exports.getRegisterUser = (req, res) => {
  res.render("auth/register-user", { title: "Registro" });
};

exports.getRegisterCommerce = async (req, res, next) => {
  try {
    const types = await CommerceType.find().lean();
    res.render("auth/register-commerce", { title: "Registro de comercio", types });
  } catch (error) {
    next(error);
  }
};

exports.postRegisterUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, username, role, password } = req.body;
    const token = crypto.randomBytes(32).toString("hex");

    await User.create({
      firstName,
      lastName,
      phone,
      email,
      username,
      role,
      password: await bcrypt.hash(password, 10),
      photo: `/uploads/users/${req.file.filename}`,
      isActive: false,
      activationToken: token,
    });

    await sendActivationEmail(email, token);
    req.flash("success", "Cuenta creada. Revisa tu correo para activarla.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

exports.postRegisterCommerce = async (req, res, next) => {
  try {
    const { commerceName, phone, email, openingTime, closingTime, commerceType, password } =
      req.body;
    const token = crypto.randomBytes(32).toString("hex");

    await User.create({
      role: "commerce",
      commerceName,
      phone,
      email,
      openingTime,
      closingTime,
      commerceType,
      password: await bcrypt.hash(password, 10),
      logo: `/uploads/logos/${req.file.filename}`,
      isActive: false,
      activationToken: token,
    });

    await sendActivationEmail(email, token);
    req.flash("success", "Comercio registrado. Revisa tu correo para activar la cuenta.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

exports.getActivate = async (req, res, next) => {
  try {
    const user = await User.findOne({ activationToken: req.params.token });
    if (!user) {
      req.flash("errors", "El enlace de activación no es válido o ya fue usado");
      return res.redirect("/login");
    }

    user.isActive = true;
    user.activationToken = undefined; // ya no se puede reutilizar
    await user.save();

    req.flash("success", "Cuenta activada. Ya puedes iniciar sesión.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Iniciar sesión" });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const value = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: value.toLowerCase() }, { username: value }],
    });

    const valid = user && (await bcrypt.compare(password, user.password));
    if (!valid) {
      req.flash("errors", "Las credenciales son incorrectas");
      return res.redirect("/login");
    }

    if (!user.isActive) {
      req.flash(
        "errors",
        "Tu cuenta está inactiva. Revisa tu correo para activarla o contacta a un administrador."
      );
      return res.redirect("/login");
    }

    req.session.user = { _id: user._id, role: user.role };

    req.session.save(() => res.redirect(homeByRole(user.role)));
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};

// ---------- Reset de contraseña ----------

exports.getForgot = (req, res) => {
  res.render("auth/forgot", { title: "Restablecer contraseña" });
};

exports.postForgot = async (req, res, next) => {
  try {
    const value = req.body.identifier.trim();
    const user = await User.findOne({
      $or: [{ email: value.toLowerCase() }, { username: value }],
    });

    if (user) {
      user.resetToken = crypto.randomBytes(32).toString("hex");
      user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1 hora
      await user.save();
      try {
        await sendResetEmail(user.email, user.resetToken);
      } catch (mailError) {
        console.error("No se pudo enviar el correo:", mailError.message);
      }
    }

    // Mismo mensaje exista o no el usuario (no revela qué cuentas existen)
    req.flash("success", "Si el usuario existe, te enviamos un correo con el enlace.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

exports.getReset = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("errors", "El enlace no es válido o ya expiró");
      return res.redirect("/login");
    }
    res.render("auth/reset", { title: "Nueva contraseña", token: req.params.token });
  } catch (error) {
    next(error);
  }
};

exports.postReset = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("errors", "El enlace no es válido o ya expiró");
      return res.redirect("/login");
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined; // ya no se puede reutilizar
    user.resetTokenExpiration = undefined;
    await user.save();

    req.flash("success", "Contraseña actualizada. Ya puedes iniciar sesión.");
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};