const STATUS = {
  pending: { label: "Pendiente", cls: "warning" },
  in_progress: { label: "En proceso", cls: "info" },
  completed: { label: "Completado", cls: "success" },
};

const money = (n) =>
  Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

module.exports = (order) => ({
  ...order,
  statusLabel: STATUS[order.status].label,
  statusClass: STATUS[order.status].cls,
  isPending: order.status === "pending",
  isInProgress: order.status === "in_progress",
  isCompleted: order.status === "completed",
  itemsCount: order.items.length,
  dateLabel: new Date(order.createdAt).toLocaleString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }),
  subtotalLabel: money(order.subtotal),
  itbisAmountLabel: money((order.subtotal * order.itbis) / 100),
  totalLabel: money(order.total),
  items: order.items.map((i) => ({ ...i, priceLabel: money(i.price) })),
});