const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const ServiceError = require("../utils/ServiceError");
const orderView = require("../utils/orderView");
const Address = require("../models/Address");
const cartService = require("./cartService");

const populateCommerce = "commerceName logo";

exports.listForCommerce = async (commerceId) => {
  const orders = await Order.find({ commerce: commerceId })
    .populate("commerce", populateCommerce)
    .sort({ createdAt: -1 })
    .lean();
  return orders.map(orderView);
};

// Siempre filtra por comercio: no se puede ver un pedido de otro
exports.getForCommerce = async (id, commerceId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const order = await Order.findOne({ _id: id, commerce: commerceId })
    .populate("commerce", populateCommerce)
    .lean();
  return order ? orderView(order) : null;
};

exports.assignDelivery = async (orderId, commerceId) => {
  const order = await Order.findOne({ _id: orderId, commerce: commerceId, status: "pending" });
  if (!order) throw new ServiceError("El pedido no existe o ya tiene un delivery asignado");

  // Reserva un delivery disponible en una sola operación
  const delivery = await User.findOneAndUpdate(
    { role: "delivery", isActive: true, deliveryStatus: "available" },
    { deliveryStatus: "busy" },
    { new: true }
  );
  if (!delivery) {
    throw new ServiceError("No hay delivery disponible en este momento. Intenta más tarde.");
  }

  // Solo pasa a "en proceso" si sigue pendiente
  const updated = await Order.findOneAndUpdate(
    { _id: orderId, status: "pending" },
    { status: "in_progress", delivery: delivery._id }
  );
  if (!updated) {
    await User.updateOne({ _id: delivery._id }, { deliveryStatus: "available" });
    throw new ServiceError("El pedido ya tiene un delivery asignado");
  }
  return delivery;
};

// Crea el pedido en estado pendiente a partir del carrito de la sesión
exports.createFromCart = async (clientId, cart, addressId) => {
  const summary = await cartService.buildSummary(cart);
  if (!summary) throw new ServiceError("Tu pedido está vacío o el comercio ya no está disponible");

  const address = mongoose.isValidObjectId(addressId)
    ? await Address.findOne({ _id: addressId, client: clientId }).lean()
    : null;
  if (!address) throw new ServiceError("Debes seleccionar una dirección válida");

  return Order.create({
    client: clientId,
    commerce: summary.commerce._id,
    address: { name: address.name, description: address.description },
    items: summary.items.map((i) => ({
      product: i.productId,
      name: i.name,
      price: i.price,
      image: i.image,
    })),
    subtotal: summary.subtotal,
    itbis: summary.itbis,
    total: summary.total,
    status: "pending",
  });
};

exports.listForClient = async (clientId) => {
  const orders = await Order.find({ client: clientId })
    .populate("commerce", populateCommerce)
    .sort({ createdAt: -1 })
    .lean();
  return orders.map(orderView);
};

// Siempre filtra por cliente
exports.getForClient = async (id, clientId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const order = await Order.findOne({ _id: id, client: clientId })
    .populate("commerce", populateCommerce)
    .lean();
  return order ? orderView(order) : null;
};

exports.listForDelivery = async (deliveryId) => {
  const orders = await Order.find({ delivery: deliveryId })
    .populate("commerce", populateCommerce)
    .sort({ createdAt: -1 })
    .lean();
  return orders.map(orderView);
};

// Siempre filtra por delivery. La dirección solo se incluye mientras está en proceso
exports.getForDelivery = async (id, deliveryId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const order = await Order.findOne({ _id: id, delivery: deliveryId })
    .populate("commerce", populateCommerce)
    .lean();
  if (!order) return null;

  const view = orderView(order);
  if (!view.isInProgress) delete view.address;
  return view;
};

exports.completeOrder = async (id, deliveryId) => {
  if (!mongoose.isValidObjectId(id)) throw new ServiceError("El pedido no existe");

  const order = await Order.findOneAndUpdate(
    { _id: id, delivery: deliveryId, status: "in_progress" },
    { status: "completed" }
  );
  if (!order) throw new ServiceError("El pedido no existe o ya fue completado");

  // El delivery queda disponible para recibir otro pedido
  await User.updateOne({ _id: deliveryId }, { deliveryStatus: "available" });
};