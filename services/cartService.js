const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Config = require("../models/Config");
const money = require("../utils/money");

const round2 = (n) => Math.round(n * 100) / 100;

// Comercio activo o null
exports.getActiveCommerce = (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findOne({ _id: id, role: "commerce", isActive: true })
    .select("commerceName logo commerceType")
    .lean();
};

// Devuelve el carrito actualizado (si el producto no es válido, lo deja igual)
exports.addProduct = async (cart, productId) => {
  if (!mongoose.isValidObjectId(productId)) return cart;
  const product = await Product.findById(productId).select("commerce").lean();
  if (!product) return cart;
  if (!(await exports.getActiveCommerce(product.commerce))) return cart;

  const commerceId = String(product.commerce);
  const current =
    cart && cart.commerceId === commerceId ? cart : { commerceId, productIds: [] };

  const id = String(productId);
  if (!current.productIds.includes(id)) current.productIds.push(id);
  return current;
};

exports.removeProduct = (cart, productId) => {
  if (!cart) return cart;
  return { ...cart, productIds: cart.productIds.filter((id) => id !== String(productId)) };
};

// Resumen recalculado desde la BD. Devuelve null si el carrito está vacío o no es válido
exports.buildSummary = async (cart) => {
  if (!cart || cart.productIds.length === 0) return null;

  const [commerce, products, config] = await Promise.all([
    exports.getActiveCommerce(cart.commerceId),
    Product.find({ _id: { $in: cart.productIds }, commerce: cart.commerceId }).lean(),
    Config.getConfig(),
  ]);
  if (!commerce || products.length === 0) return null;

  // Conserva el orden en que se agregaron
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const items = cart.productIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((p) => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      image: p.image,
      priceLabel: money(p.price),
    }));

  const subtotal = round2(items.reduce((sum, i) => sum + i.price, 0));
  const itbis = config.itbis;
  const total = round2(subtotal * (itbis / 100) + subtotal);

  return {
    commerce,
    items,
    subtotal,
    itbis,
    total,
    subtotalLabel: money(subtotal),
    itbisAmountLabel: money(subtotal * (itbis / 100)),
    totalLabel: money(total),
  };
};

// Productos del comercio agrupados por categoría (solo categorías con productos)
exports.getCatalog = async (commerceId, cart) => {
  const [categories, products] = await Promise.all([
    Category.find({ commerce: commerceId }).sort({ name: 1 }).lean(),
    Product.find({ commerce: commerceId }).sort({ name: 1 }).lean(),
  ]);
  const inCart = new Set(cart ? cart.productIds : []);

  return categories
    .map((c) => ({
      ...c,
      products: products
        .filter((p) => String(p.category) === String(c._id))
        .map((p) => ({ ...p, priceLabel: money(p.price), inCart: inCart.has(String(p._id)) })),
    }))
    .filter((c) => c.products.length > 0);
};