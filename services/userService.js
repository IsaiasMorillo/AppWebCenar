const User = require("../models/User");
const Order = require("../models/Order");

// Qué campo de Order apunta a cada rol y qué pedidos cuentan
const ORDER_RULES = {
  client: { field: "client", filter: {} },
  delivery: { field: "delivery", filter: { status: "completed" } }, // solo entregados
  commerce: { field: "commerce", filter: {} },
};

exports.listWithOrderCount = async (role) => {
  const rule = ORDER_RULES[role];
  const users = await User.find({ role }).sort({ createdAt: -1 }).lean();

  const counts = await Order.aggregate([
    { $match: { ...rule.filter, [rule.field]: { $ne: null } } },
    { $group: { _id: `$${rule.field}`, total: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.total]));

  return users.map((u) => ({ ...u, ordersCount: countMap.get(String(u._id)) || 0 }));
};

// Devuelve el usuario actualizado, o null si no existe
exports.toggleActive = async (id, role) => {
  const user = await User.findOne({ _id: id, role });
  if (!user) return null;
  user.isActive = !user.isActive;
  await user.save();
  return user;
};