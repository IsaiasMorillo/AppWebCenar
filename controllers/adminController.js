const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboard = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const countUsers = (role) =>
      Promise.all([
        User.countDocuments({ role, isActive: true }),
        User.countDocuments({ role, isActive: false }),
      ]);

    const [
      totalOrders,
      todayOrders,
      [commercesActive, commercesInactive],
      [clientsActive, clientsInactive],
      [deliveriesActive, deliveriesInactive],
      totalProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      countUsers("commerce"),
      countUsers("client"),
      countUsers("delivery"),
      Product.countDocuments(),
    ]);

    res.render("admin/dashboard", {
      title: "Dashboard",
      stats: {
        totalOrders,
        todayOrders,
        commercesActive,
        commercesInactive,
        clientsActive,
        clientsInactive,
        deliveriesActive,
        deliveriesInactive,
        totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};