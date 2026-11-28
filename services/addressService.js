const mongoose = require("mongoose");
const Address = require("../models/Address");

const isValid = (id) => mongoose.isValidObjectId(id);

exports.list = (clientId) => Address.find({ client: clientId }).sort({ createdAt: -1 }).lean();

// Siempre filtra por cliente
exports.getById = (id, clientId) => {
  if (!isValid(id)) return null;
  return Address.findOne({ _id: id, client: clientId }).lean();
};

exports.create = (clientId, { name, description }) =>
  Address.create({ name, description, client: clientId });

// Devuelve null si no existe
exports.update = async (id, clientId, { name, description }) => {
  if (!isValid(id)) return null;
  const address = await Address.findOne({ _id: id, client: clientId });
  if (!address) return null;
  Object.assign(address, { name, description });
  return address.save();
};

// Devuelve false si no existe
exports.remove = async (id, clientId) => {
  if (!isValid(id)) return false;
  const result = await Address.deleteOne({ _id: id, client: clientId });
  return result.deletedCount > 0;
};