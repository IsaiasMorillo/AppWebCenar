const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CommerceType = require("../models/CommerceType");
const ServiceError = require("../utils/ServiceError");
const { sendActivationEmail, sendResetEmail } = require("./emailService");

const newToken = () => crypto.randomBytes(32).toString("hex");

// Crea el usuario y envía el correo; si el correo falla, revierte para poder reintentar
const createAndNotify = async (data) => {
  const token = newToken();
  const user = await User.create({ ...data, isActive: false, activationToken: token });
  try {
    await sendActivationEmail(user.email, token);
  } catch (mailError) {
    await User.findByIdAndDelete(user._id);
    throw new ServiceError("No pudimos enviar el correo de activación. Intenta de nuevo.");
  }
  return user;
};

exports.getCommerceTypes = () => CommerceType.find().lean();

exports.registerUser = async (body, file) => {
  const { firstName, lastName, phone, email, username, role, password } = body;
  return createAndNotify({
    firstName,
    lastName,
    phone,
    email,
    username,
    role,
    password: await bcrypt.hash(password, 10),
    photo: `/uploads/users/${file.filename}`,
  });
};

exports.registerCommerce = async (body, file) => {
  const { commerceName, phone, email, openingTime, closingTime, commerceType, password } = body;
  return createAndNotify({
    role: "commerce",
    commerceName,
    phone,
    email,
    openingTime,
    closingTime,
    commerceType,
    password: await bcrypt.hash(password, 10),
    logo: `/uploads/logos/${file.filename}`,
  });
};

// Devuelve true si activó, false si el token no sirve
exports.activate = async (token) => {
  const user = await User.findOne({ activationToken: token });
  if (!user) return false;
  user.isActive = true;
  user.activationToken = undefined;
  await user.save();
  return true;
};

const findByIdentifier = (identifier) => {
  const value = identifier.trim();
  return User.findOne({ $or: [{ email: value.toLowerCase() }, { username: value }] });
};

// Devuelve el usuario o lanza ServiceError
exports.authenticate = async (identifier, password) => {
  const user = await findByIdentifier(identifier);
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw new ServiceError("Las credenciales son incorrectas");
  if (!user.isActive) {
    throw new ServiceError(
      "Tu cuenta está inactiva. Revisa tu correo para activarla o contacta a un administrador."
    );
  }
  return user;
};

exports.requestPasswordReset = async (identifier) => {
  const user = await findByIdentifier(identifier);
  if (!user) return; // el controller responde igual exista o no
  user.resetToken = newToken();
  user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
  await user.save();
  try {
    await sendResetEmail(user.email, user.resetToken);
  } catch (mailError) {
    console.error("No se pudo enviar el correo:", mailError.message);
  }
};

const findByValidResetToken = (token) =>
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

exports.isResetTokenValid = async (token) => !!(await findByValidResetToken(token));

exports.resetPassword = async (token, newPassword) => {
  const user = await findByValidResetToken(token);
  if (!user) return false;
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();
  return true;
};