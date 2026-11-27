const Category = require("../models/Category");
const Product = require("../models/Product");
const ServiceError = require("../utils/ServiceError");

exports.listWithCount = async (commerceId) => {
  const categories = await Category.find({ commerce: commerceId }).sort({ name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { commerce: commerceId } },
    { $group: { _id: "$category", total: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.total]));
  return categories.map((c) => ({ ...c, productsCount: map.get(String(c._id)) || 0 }));
};

// Siempre filtra por comercio: un comercio no puede tocar categorías de otro
exports.getById = (id, commerceId) => Category.findOne({ _id: id, commerce: commerceId }).lean();

exports.create = (commerceId, { name, description }) =>
  Category.create({ name, description, commerce: commerceId });

exports.update = async (id, commerceId, { name, description }) => {
  const category = await Category.findOne({ _id: id, commerce: commerceId });
  if (!category) return null;
  Object.assign(category, { name, description });
  return category.save();
};

exports.remove = async (id, commerceId) => {
  const category = await Category.findOne({ _id: id, commerce: commerceId });
  if (!category) return false;

  const inUse = await Product.countDocuments({ category: id });
  if (inUse > 0) {
    throw new ServiceError(
      `No se puede eliminar: la categoría tiene ${inUse} producto(s). Elimínalos o muévelos primero.`
    );
  }
  await category.deleteOne();
  return true;
};