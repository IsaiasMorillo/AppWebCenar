const User = require("../models/User");
const removeFile = require("../utils/removeFile");

exports.getProfile = (id) => User.findById(id).lean();

exports.updateProfile = async (id, { openingTime, closingTime, phone, email }, file) => {
  const commerce = await User.findOne({ _id: id, role: "commerce" });
  if (!commerce) return null;

  const oldLogo = commerce.logo;
  Object.assign(commerce, { openingTime, closingTime, phone, email });
  if (file) commerce.logo = `/uploads/logos/${file.filename}`;
  await commerce.save();

  if (file) removeFile(oldLogo);
  return commerce;
};