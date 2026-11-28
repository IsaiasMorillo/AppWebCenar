const mongoose = require("mongoose");
const CommerceType = require("../models/CommerceType");
const User = require("../models/User");
const Favorite = require("../models/Favorite");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.listTypes = () => CommerceType.find().sort({ name: 1 }).lean();

exports.getType = (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return CommerceType.findById(id).lean();
};

// Comercios activos de un tipo, con búsqueda por nombre y marca de favorito
exports.listCommerces = async (typeId, clientId, search = "") => {
  const filter = { role: "commerce", isActive: true, commerceType: typeId };
  const term = search.trim();
  if (term) filter.commerceName = { $regex: escapeRegex(term), $options: "i" };

  const [commerces, favorites] = await Promise.all([
    User.find(filter).select("commerceName logo").sort({ commerceName: 1 }).lean(),
    Favorite.find({ client: clientId }).select("commerce").lean(),
  ]);
  const favSet = new Set(favorites.map((f) => String(f.commerce)));

  return commerces.map((c) => ({ ...c, isFavorite: favSet.has(String(c._id)) }));
};

// Marca o quita el favorito. Solo permite comercios activos
exports.toggleFavorite = async (clientId, commerceId) => {
  if (!mongoose.isValidObjectId(commerceId)) return;

  const removed = await Favorite.findOneAndDelete({ client: clientId, commerce: commerceId });
  if (removed) return;

  const commerce = await User.exists({ _id: commerceId, role: "commerce", isActive: true });
  if (commerce) await Favorite.create({ client: clientId, commerce: commerceId });
};

// Comercios favoritos activos del cliente
exports.listFavorites = async (clientId) => {
  const favorites = await Favorite.find({ client: clientId })
    .populate({ path: "commerce", match: { isActive: true }, select: "commerceName logo" })
    .sort({ createdAt: -1 })
    .lean();
  return favorites.filter((f) => f.commerce).map((f) => f.commerce);
};

exports.removeFavorite = async (clientId, commerceId) => {
  if (!mongoose.isValidObjectId(commerceId)) return;
  await Favorite.deleteOne({ client: clientId, commerce: commerceId });
};