const CommerceType = require("../models/CommerceType");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Favorite = require("../models/Favorite");
const Order = require("../models/Order");
const removeFile = require("../utils/removeFile");

exports.listWithCount = async () => {
  const types = await CommerceType.find().sort({ name: 1 }).lean();
  const counts = await User.aggregate([
    { $match: { role: "commerce", commerceType: { $ne: null } } },
    { $group: { _id: "$commerceType", total: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.total]));
  return types.map((t) => ({ ...t, commercesCount: map.get(String(t._id)) || 0 }));
};

exports.getById = (id) => CommerceType.findById(id).lean();

exports.create = ({ name, description }, file) =>
  CommerceType.create({ name, description, icon: `/uploads/icons/${file.filename}` });

// Devuelve null si no existe
exports.update = async (id, { name, description }, file) => {
  const type = await CommerceType.findById(id);
  if (!type) return null;

  const oldIcon = type.icon;
  type.name = name;
  type.description = description;
  if (file) type.icon = `/uploads/icons/${file.filename}`;
  await type.save();

  if (file) removeFile(oldIcon); // el icono anterior ya no se usa
  return type;
};

// Elimina el tipo y todo lo asociado. Devuelve false si no existe
exports.remove = async (id) => {
  const type = await CommerceType.findById(id);
  if (!type) return false;

  const commerces = await User.find({ role: "commerce", commerceType: id }).select("logo");
  const commerceIds = commerces.map((c) => c._id);

  const products = await Product.find({ commerce: { $in: commerceIds } }).select("image");

  // Libera a los delivery que tenían un pedido en proceso de estos comercios
  const inProgress = await Order.find({
    commerce: { $in: commerceIds },
    status: "in_progress",
    delivery: { $ne: null },
  }).select("delivery");
  await User.updateMany(
    { _id: { $in: inProgress.map((o) => o.delivery) } },
    { deliveryStatus: "available" }
  );

  await Promise.all([
    Order.deleteMany({ commerce: { $in: commerceIds } }),
    Favorite.deleteMany({ commerce: { $in: commerceIds } }),
    Product.deleteMany({ commerce: { $in: commerceIds } }),
    Category.deleteMany({ commerce: { $in: commerceIds } }),
    User.deleteMany({ _id: { $in: commerceIds } }),
  ]);
  await type.deleteOne();

  commerces.forEach((c) => removeFile(c.logo));
  products.forEach((p) => removeFile(p.image));
  removeFile(type.icon);
  return true;
};