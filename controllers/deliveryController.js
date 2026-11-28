const orderService = require("../services/orderService");
const userProfileService = require("../services/userProfileService");
const handle = require("../utils/handle");

exports.getHome = handle("/login", async (req, res) => {
  res.render("delivery/home", {
    title: "Home del delivery",
    orders: await orderService.listForDelivery(req.session.user._id),
  });
});

exports.getOrder = handle("/delivery", async (req, res) => {
  const order = await orderService.getForDelivery(req.params.id, req.session.user._id);
  if (!order) return res.redirect("/delivery");
  res.render("delivery/order-detail", { title: "Detalle del pedido", order });
});

exports.postComplete = handle(
  (req) => `/delivery/orders/${req.params.id}`,
  async (req, res) => {
    await orderService.completeOrder(req.params.id, req.session.user._id);
    req.flash("success", "Pedido completado. Ya estás disponible.");
    res.redirect(`/delivery/orders/${req.params.id}`);
  }
);

exports.getProfile = handle("/delivery", async (req, res) => {
  const delivery = await userProfileService.get(req.session.user._id);
  res.render("delivery/profile", { title: "Mi perfil", delivery });
});

exports.postProfile = handle("/delivery/profile", async (req, res) => {
  await userProfileService.update(req.session.user._id, "delivery", req.body, req.file);
  req.flash("success", "Perfil actualizado");
  res.redirect("/delivery/profile");
});