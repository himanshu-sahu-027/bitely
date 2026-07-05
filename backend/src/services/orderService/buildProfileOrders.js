// This logic is intentionally copied from the frontend profile utility
// so later comparisons can be made without losing the original behavior.
export default function buildProfileOrders({
  orders,
  orderItems,
  orderPricing,
  orderStatusHistory,
  kitchens,
  addresses,
}) {
  const kitchenById = Object.fromEntries(
    kitchens.map((kitchen) => [kitchen.id, kitchen])
  );
  const itemsByOrderId = orderItems.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push(item);
    return acc;
  }, {});
  const pricingByOrderId = Object.fromEntries(
    orderPricing.map((pricing) => [pricing.orderId, pricing])
  );
  const historyByOrderId = orderStatusHistory.reduce((acc, entry) => {
    if (!acc[entry.orderId]) {
      acc[entry.orderId] = [];
    }
    acc[entry.orderId].push(entry);
    return acc;
  }, {});

  const mappedOrders = orders.map((order, index) => {
    const kitchen = kitchenById[order.kitchenId];
    const pricing = pricingByOrderId[order.id] ?? {};
    const address = addresses[index % addresses.length];
    const items = (itemsByOrderId[order.id] ?? []).map((item) => ({
      ...item,
      qty: item.quantity,
    }));
    const deliveredEntry = (historyByOrderId[order.id] ?? []).find(
      (entry) => entry.status === "delivered"
    );
    const deliveredBy =
      deliveredEntry?.message?.replace(/^Delivered by\s+/i, "") ?? null;
    const etaMins = kitchen?.deliveryTime
      ? Number.parseInt(kitchen.deliveryTime, 10)
      : null;

    return {
      id: order.id,
      orderId: order.id,
      kitchenName: order.kitchenName || kitchen?.name || "Kitchen",
      location: kitchen?.address || "Location unavailable",
      image: kitchen?.image || order.kitchenImageUrl,
      status: order.status,
      date: order.placedAt,
      placedAt: order.placedAt,
      deliveredAt: order.deliveredAt,
      deliveredBy,
      etaMins,
      paymentStatus: order.paymentStatus,
      paymentMethod:
        order.paymentMethod === "COD"
          ? "Pay on Delivery"
          : `Paid via ${order.paymentMethod}`,
      paymentCompleted: order.paymentStatus === "paid",
      totalAmount: order.totalAmount,
      totalPaid: order.paymentStatus === "paid" ? order.totalAmount : 0,
      totalPayable: order.totalAmount,
      deliveryAddressLabel: address?.label ?? "Address",
      deliveryAddress: address?.fullAddress ?? "Address unavailable",
      itemTotal: pricing.itemTotal ?? 0,
      packagingFee: pricing.packagingFee ?? 0,
      platformFee: pricing.platformFee ?? 0,
      deliveryFee: pricing.deliveryFee ?? 0,
      taxes: pricing.tax ?? 0,
      discountLabel: (pricing.discount ?? 0) > 0 ? "Discount Applied" : null,
      discountAmount: pricing.discount ?? 0,
      items,
    };
  });

  return {
    active: mappedOrders.filter(
      (order) => !["delivered", "cancelled"].includes(order.status)
    ),
    past: mappedOrders.filter((order) =>
      ["delivered", "cancelled"].includes(order.status)
    ),
  };
}
