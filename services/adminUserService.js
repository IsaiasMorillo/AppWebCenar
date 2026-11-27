const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ServiceError = require("../utils/ServiceError");

const assertNotSelf = (id, currentId, action) => {
  if (String(id) === String(currentId)) {
    throw new ServiceError(`No puedes ${action} tu propio usuario`);
  }
};

exports.list = async (currentId) => {
  const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 }).lean();
  return admins.map((a) => ({ ...a, isMe: String(a._id) === String(currentId) }));
};

exports.create = async ({ firstName, lastName, idCard, email, username, password }) =>
  User.create({
    role: "admin",
    firstName,
    lastName,
    idCard,
    email,
    username,
    password: await bcrypt.hash(password, 10),
    isActive: true,
  });

exports.getForEdit = async (id, currentId) => {
  assertNotSelf(id, currentId, "editar");
  return User.findOne({ _id: id, role: "admin" }).lean();
};

exports.update = async (id, currentId, data) => {
  assertNotSelf(id, currentId, "editar");
  const admin = await User.findOne({ _id: id, role: "admin" });
  if (!admin) return null;

  const { firstName, lastName, idCard, email, username, password } = data;
  Object.assign(admin, { firstName, lastName, idCard, email, username });
  admin.password = await bcrypt.hash(password, 10);
  return admin.save();
};

exports.toggle = async (id, currentId) => {
  assertNotSelf(id, currentId, "inactivar");
  const admin = await User.findOne({ _id: id, role: "admin" });
  if (!admin) return null;
  admin.isActive = !admin.isActive;
  return admin.save();
};