const User = require("../models/User");
const removeFile = require("../utils/removeFile");

exports.get = (id) => User.findById(id).lean();

// Sirve para cliente y delivery. Devuelve null si no existe
exports.update = async (id, role, { firstName, lastName, phone }, file) => {
  const user = await User.findOne({ _id: id, role });
  if (!user) return null;

  const oldPhoto = user.photo;
  Object.assign(user, { firstName, lastName, phone });
  if (file) user.photo = `/uploads/users/${file.filename}`;
  await user.save();

  if (file) removeFile(oldPhoto);
  return user;
};