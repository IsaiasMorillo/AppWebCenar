const statsService = require("../services/statsService");
const userService = require("../services/userService");
const configService = require("../services/configService");
const adminUserService = require("../services/adminUserService");
const ServiceError = require("../utils/ServiceError");

// Si es un error de negocio, lo muestra con flash; si no, lo manda al manejador de Express
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error instanceof ServiceError) {
      req.flash("errors", error.message);
      return res.redirect("/admin/admins");
    }
    next(error);
  }
};

exports.getDashboard = handle(async (req, res) => {
  res.render("admin/dashboard", {
    title: "Dashboard",
    stats: await statsService.getDashboardStats(),
  });
});

// ---------- Listados de usuarios ----------
const LISTS = {
  client: { title: "Clientes", base: "/admin/clients" },
  delivery: { title: "Delivery", base: "/admin/deliveries" },
  commerce: { title: "Comercios", base: "/admin/commerces" },
};

const listUsers = (role) =>
  handle(async (req, res) => {
    res.render(`admin/list-${role}`, {
      title: LISTS[role].title,
      users: await userService.listWithOrderCount(role),
      base: LISTS[role].base,
    });
  });

const toggleUser = (role) =>
  handle(async (req, res) => {
    const user = await userService.toggleActive(req.params.id, role);
    if (user) req.flash("success", `Usuario ${user.isActive ? "activado" : "inactivado"}`);
    res.redirect(LISTS[role].base);
  });

exports.listClients = listUsers("client");
exports.listDeliveries = listUsers("delivery");
exports.listCommerces = listUsers("commerce");
exports.toggleClient = toggleUser("client");
exports.toggleDelivery = toggleUser("delivery");
exports.toggleCommerce = toggleUser("commerce");

// ---------- Configuración ----------
exports.getConfig = handle(async (req, res) => {
  res.render("admin/config", { title: "Configuración", config: await configService.get() });
});

exports.getEditConfig = handle(async (req, res) => {
  res.render("admin/config-edit", {
    title: "Editar configuración",
    config: await configService.get(),
  });
});

exports.postEditConfig = handle(async (req, res) => {
  await configService.updateItbis(req.body.itbis);
  req.flash("success", "Configuración actualizada");
  res.redirect("/admin/config");
});

// ---------- Administradores ----------
exports.listAdmins = handle(async (req, res) => {
  res.render("admin/list-admins", {
    title: "Administradores",
    admins: await adminUserService.list(req.session.user._id),
  });
});

exports.getCreateAdmin = (req, res) => {
  res.render("admin/admin-form", { title: "Crear administrador", isEdit: false });
};

exports.postCreateAdmin = handle(async (req, res) => {
  await adminUserService.create(req.body);
  req.flash("success", "Administrador creado");
  res.redirect("/admin/admins");
});

exports.getEditAdmin = handle(async (req, res) => {
  const admin = await adminUserService.getForEdit(req.params.id, req.session.user._id);
  if (!admin) return res.redirect("/admin/admins");
  res.render("admin/admin-form", { title: "Editar administrador", isEdit: true, admin });
});

exports.postEditAdmin = handle(async (req, res) => {
  await adminUserService.update(req.params.id, req.session.user._id, req.body);
  req.flash("success", "Administrador actualizado");
  res.redirect("/admin/admins");
});

exports.toggleAdmin = handle(async (req, res) => {
  const admin = await adminUserService.toggle(req.params.id, req.session.user._id);
  if (admin) req.flash("success", `Administrador ${admin.isActive ? "activado" : "inactivado"}`);
  res.redirect("/admin/admins");
});