const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const ServiceError = require("../utils/ServiceError");
const removeFile = require("../utils/removeFile");

const assertOwnCategory = async (categoryId, commerceId) => {
  const category = await Category.findOne({ _id: categoryId, commerce: commerceId });
  if (!category) throw new ServiceError("La categoría seleccionada no es válida");
};

exports.list = (commerceId) =>
  Product.find({ commerce: commerceId })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

// Siempre filtra por comercio
exports.getById = (id, commerceId) => Product.findOne({ _id: id, commerce: commerceId }).lean();

exports.getCategories = (commerceId) =>
  Category.find({ commerce: commerceId }).sort({ name: 1 }).lean();

exports.create = async (commerceId, { name, description, price, category }, file) => {
  await assertOwnCategory(category, commerceId);
  return Product.create({
    name,
    description,
    price: Number(price),
    category,
    commerce: commerceId,
    image: `/uploads/products/${file.filename}`,
  });
};

exports.update = async (id, commerceId, { name, description, price, category }, file) => {
  const product = await Product.findOne({ _id: id, commerce: commerceId });
  if (!product) return null;
  await assertOwnCategory(category, commerceId);

  const oldImage = product.image;
  Object.assign(product, { name, description, price: Number(price), category });
  if (file) product.image = `/uploads/products/${file.filename}`;
  await product.save();

  if (file) await removeIfUnused(oldImage);
  return product;
};

exports.remove = async (id, commerceId) => {
  const product = await Product.findOne({ _id: id, commerce: commerceId });
  if (!product) return false;
  await product.deleteOne();
  await removeIfUnused(product.image);
  return true;
};

// Borra el archivo solo si ningún pedido histórico lo usa
async function removeIfUnused(imagePath) {
  const used = await Order.exists({ "items.image": imagePath });
  if (!used) removeFile(imagePath);
}