const mongoose = require("mongoose");
const commerceProfileService = require("../services/commerceProfileService");
const categoryService = require("../services/categoryService");
const handle = require("../utils/handle");
const productService = require("../services/productService");
const PRODUCTS = "/commerce/products";
const orderService = require("../services/orderService");

const CATEGORIES = "/commerce/categories";
const commerceId = (req) => new mongoose.Types.ObjectId(req.session.user._id);

// ---------- Perfil ----------
exports.getProfile = handle("/commerce", async (req, res) => {
  const commerce = await commerceProfileService.getProfile(req.session.user._id);
  res.render("commerce/profile", { title: "Perfil del comercio", commerce });
});

exports.postProfile = handle("/commerce/profile", async (req, res) => {
  await commerceProfileService.updateProfile(req.session.user._id, req.body, req.file);
  req.flash("success", "Perfil actualizado");
  res.redirect("/commerce/profile");
});

// ---------- Categorías ----------
exports.listCategories = handle("/commerce", async (req, res) => {
  res.render("commerce/list-categories", {
    title: "Categorías",
    categories: await categoryService.listWithCount(commerceId(req)),
  });
});

exports.getCreateCategory = (req, res) => {
  res.render("commerce/category-form", { title: "Crear categoría", isEdit: false });
};

exports.postCreateCategory = handle(`${CATEGORIES}/create`, async (req, res) => {
  await categoryService.create(commerceId(req), req.body);
  req.flash("success", "Categoría creada");
  res.redirect(CATEGORIES);
});

exports.getEditCategory = handle(CATEGORIES, async (req, res) => {
  const category = await categoryService.getById(req.params.id, commerceId(req));
  if (!category) return res.redirect(CATEGORIES);
  res.render("commerce/category-form", { title: "Editar categoría", isEdit: true, category });
});

exports.postEditCategory = handle(CATEGORIES, async (req, res) => {
  await categoryService.update(req.params.id, commerceId(req), req.body);
  req.flash("success", "Categoría actualizada");
  res.redirect(CATEGORIES);
});

exports.getDeleteCategory = handle(CATEGORIES, async (req, res) => {
  const category = await categoryService.getById(req.params.id, commerceId(req));
  if (!category) return res.redirect(CATEGORIES);
  res.render("commerce/category-delete", { title: "Eliminar categoría", category });
});

exports.postDeleteCategory = handle(CATEGORIES, async (req, res) => {
  if (await categoryService.remove(req.params.id, commerceId(req))) {
    req.flash("success", "Categoría eliminada");
  }
  res.redirect(CATEGORIES);
});

// ---------- Productos ----------
exports.listProducts = handle("/commerce", async (req, res) => {
  res.render("commerce/list-products", {
    title: "Productos",
    products: await productService.list(commerceId(req)),
  });
});

exports.getCreateProduct = handle(PRODUCTS, async (req, res) => {
  res.render("commerce/product-form", {
    title: "Crear producto",
    isEdit: false,
    categories: await productService.getCategories(commerceId(req)),
  });
});

exports.postCreateProduct = handle(`${PRODUCTS}/create`, async (req, res) => {
  await productService.create(commerceId(req), req.body, req.file);
  req.flash("success", "Producto creado");
  res.redirect(PRODUCTS);
});

exports.getEditProduct = handle(PRODUCTS, async (req, res) => {
  const product = await productService.getById(req.params.id, commerceId(req));
  if (!product) return res.redirect(PRODUCTS);
  const categories = await productService.getCategories(commerceId(req));
  // marca la categoría actual para el select
  categories.forEach((c) => (c.selected = String(c._id) === String(product.category)));
  res.render("commerce/product-form", {
    title: "Editar producto",
    isEdit: true,
    product,
    categories,
  });
});

exports.postEditProduct = handle(
  (req) => `${PRODUCTS}/${req.params.id}/edit`,
  async (req, res) => {
    await productService.update(req.params.id, commerceId(req), req.body, req.file);
    req.flash("success", "Producto actualizado");
    res.redirect(PRODUCTS);
  }
);

exports.getDeleteProduct = handle(PRODUCTS, async (req, res) => {
  const product = await productService.getById(req.params.id, commerceId(req));
  if (!product) return res.redirect(PRODUCTS);
  res.render("commerce/product-delete", { title: "Eliminar producto", product });
});

exports.postDeleteProduct = handle(PRODUCTS, async (req, res) => {
  if (await productService.remove(req.params.id, commerceId(req))) {
    req.flash("success", "Producto eliminado");
  }
  res.redirect(PRODUCTS);
});

// ---------- Pedidos ----------
exports.getHome = handle("/commerce", async (req, res) => {
  res.render("commerce/home", {
    title: "Home del comercio",
    orders: await orderService.listForCommerce(commerceId(req)),
  });
});

exports.getOrder = handle("/commerce", async (req, res) => {
  const order = await orderService.getForCommerce(req.params.id, commerceId(req));
  if (!order) return res.redirect("/commerce");
  res.render("commerce/order-detail", { title: "Detalle del pedido", order });
});

exports.postAssignDelivery = handle(
  (req) => `/commerce/orders/${req.params.id}`,
  async (req, res) => {
    await orderService.assignDelivery(req.params.id, commerceId(req));
    req.flash("success", "Delivery asignado. El pedido está en proceso.");
    res.redirect(`/commerce/orders/${req.params.id}`);
  }
);