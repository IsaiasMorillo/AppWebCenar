const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

const countByActive = async (role) => {
  const [active, inactive] = await Promise.all([
    User.countDocuments({ role, isActive: true }),
    User.countDocuments({ role, isActive: false }),
  ]);
  return { active, inactive };
};

exports.getDashboardStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, commerces, clients, deliveries, totalProducts] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      countByActive("commerce"),
      countByActive("client"),
      countByActive("delivery"),
      Product.countDocuments(),
    ]);

  return {
    totalOrders,
    todayOrders,
    commercesActive: commerces.active,
    commercesInactive: commerces.inactive,
    clientsActive: clients.active,
    clientsInactive: clients.inactive,
    deliveriesActive: deliveries.active,
    deliveriesInactive: deliveries.inactive,
    totalProducts,
  };
};