const clientCommerceService = require("../services/clientCommerceService");
const handle = require("../utils/handle");
const addressService = require("../services/addressService");
const ADDRESSES = "/client/addresses";
const cartService = require("../services/cartService");
const orderService = require("../services/orderService");
const userProfileService = require("../services/userProfileService");

exports.getHome = handle("/login", async (req, res) => {
  res.render("client/home", {
    title: "Home",
    types: await clientCommerceService.listTypes(),
  });
});

exports.getCommerces = handle("/client", async (req, res) => {
  const type = await clientCommerceService.getType(req.params.typeId);
  if (!type) return res.redirect("/client");

  const search = req.query.q || "";
  const commerces = await clientCommerceService.listCommerces(
    type._id,
    req.session.user._id,
    search
  );

  res.render("client/commerces", {
    title: type.name,
    type,
    commerces,
    count: commerces.length,
    search,
  });
});

exports.postToggleFavorite = handle("/client", async (req, res) => {
  await clientCommerceService.toggleFavorite(req.session.user._id, req.params.commerceId);

  // Vuelve al listado de donde vino, conservando tipo y búsqueda
  const { typeId, q } = req.body;
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  res.redirect(typeId ? `/client/types/${typeId}${query}` : "/client/favorites");
});

// ---------- Direcciones ----------
exports.listAddresses = handle("/client", async (req, res) => {
  res.render("client/addresses", {
    title: "Mis direcciones",
    addresses: await addressService.list(req.session.user._id),
  });
});

exports.getCreateAddress = (req, res) => {
  res.render("client/address-form", { title: "Crear dirección", isEdit: false });
};

exports.postCreateAddress = handle(`${ADDRESSES}/create`, async (req, res) => {
  await addressService.create(req.session.user._id, req.body);
  req.flash("success", "Dirección creada");
  res.redirect(ADDRESSES);
});

exports.getEditAddress = handle(ADDRESSES, async (req, res) => {
  const address = await addressService.getById(req.params.id, req.session.user._id);
  if (!address) return res.redirect(ADDRESSES);
  res.render("client/address-form", { title: "Editar dirección", isEdit: true, address });
});

exports.postEditAddress = handle(ADDRESSES, async (req, res) => {
  await addressService.update(req.params.id, req.session.user._id, req.body);
  req.flash("success", "Dirección actualizada");
  res.redirect(ADDRESSES);
});

exports.getDeleteAddress = handle(ADDRESSES, async (req, res) => {
  const address = await addressService.getById(req.params.id, req.session.user._id);
  if (!address) return res.redirect(ADDRESSES);
  res.render("client/address-delete", { title: "Eliminar dirección", address });
});

exports.postDeleteAddress = handle(ADDRESSES, async (req, res) => {
  if (await addressService.remove(req.params.id, req.session.user._id)) {
    req.flash("success", "Dirección eliminada");
  }
  res.redirect(ADDRESSES);
});

// ---------- Catálogo, carrito y pedido ----------
// Guarda la sesión antes de redirigir para que el carrito no se pierda
const saveAndRedirect = (req, res, url) => req.session.save(() => res.redirect(url));
const catalogUrl = (cart) => (cart ? `/client/commerces/${cart.commerceId}` : "/client");

exports.getCatalog = handle("/client", async (req, res) => {
  const commerce = await cartService.getActiveCommerce(req.params.commerceId);
  if (!commerce) return res.redirect("/client");

  // Un solo comercio a la vez
  if (req.session.cart && req.session.cart.commerceId !== String(commerce._id)) {
    req.session.cart = null;
  }

  res.render("client/catalog", {
    title: commerce.commerceName,
    commerce,
    categories: await cartService.getCatalog(commerce._id, req.session.cart),
    cart: await cartService.buildSummary(req.session.cart),
  });
});

exports.postAddToCart = handle("/client", async (req, res) => {
  req.session.cart = await cartService.addProduct(req.session.cart, req.params.productId);
  saveAndRedirect(req, res, catalogUrl(req.session.cart));
});

exports.postRemoveFromCart = handle("/client", async (req, res) => {
  req.session.cart = cartService.removeProduct(req.session.cart, req.params.productId);
  saveAndRedirect(req, res, catalogUrl(req.session.cart));
});

exports.getCheckout = handle("/client", async (req, res) => {
  const summary = await cartService.buildSummary(req.session.cart);
  if (!summary) {
    req.flash("errors", "Tu pedido está vacío");
    return res.redirect("/client");
  }
  res.render("client/checkout", {
    title: "Confirmar pedido",
    summary,
    addresses: await addressService.list(req.session.user._id),
  });
});

exports.postCheckout = handle("/client/checkout", async (req, res) => {
  await orderService.createFromCart(req.session.user._id, req.session.cart, req.body.addressId);
  req.session.cart = null;
  req.flash("success", "Pedido realizado. Está pendiente de confirmación.");
  saveAndRedirect(req, res, "/client");
});

// ---------- Perfil ----------
exports.getProfile = handle("/client", async (req, res) => {
  const client = await userProfileService.get(req.session.user._id);
  res.render("client/profile", { title: "Mi perfil", client });
});

exports.postProfile = handle("/client/profile", async (req, res) => {
  await userProfileService.update(req.session.user._id, "client", req.body, req.file);
  req.flash("success", "Perfil actualizado");
  res.redirect("/client/profile");
});

// ---------- Pedidos ----------
exports.listOrders = handle("/client", async (req, res) => {
  res.render("client/orders", {
    title: "Mis pedidos",
    orders: await orderService.listForClient(req.session.user._id),
  });
});

exports.getOrder = handle("/client/orders", async (req, res) => {
  const order = await orderService.getForClient(req.params.id, req.session.user._id);
  if (!order) return res.redirect("/client/orders");
  res.render("client/order-detail", { title: "Detalle del pedido", order });
});

// ---------- Favoritos ----------
exports.listFavorites = handle("/client", async (req, res) => {
  res.render("client/favorites", {
    title: "Mis favoritos",
    commerces: await clientCommerceService.listFavorites(req.session.user._id),
  });
});

exports.postRemoveFavorite = handle("/client/favorites", async (req, res) => {
  await clientCommerceService.removeFavorite(req.session.user._id, req.params.commerceId);
  res.redirect("/client/favorites");
});