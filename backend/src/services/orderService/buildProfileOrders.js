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
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {});
  const pricingByOrderId = Object.fromEntries(
    orderPricing.map((pricing) => [pricing.order_id, pricing])
  );
  const historyByOrderId = orderStatusHistory.reduce((acc, entry) => {
    if (!acc[entry.order_id]) {
      acc[entry.order_id] = [];
    }
    acc[entry.order_id].push(entry);
    return acc;
  }, {});

  const mappedOrders = orders.map((order, index) => {
    const kitchen = kitchenById[order.kitchen_id];
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
      kitchenName: order.kitchen_name || kitchen?.name || "Kitchen",
      location: kitchen?.address || "Location unavailable",
      image: kitchen?.image || order.kitchen_image,
      status: order.status,
      date: order.placed_at,
      placedAt: order.placed_at,
      deliveredAt: order.delivered_at,
      deliveredBy,
      etaMins,
      paymentStatus: order.payment_status,
      paymentMethod:
        order.payment_method === "COD"
          ? "Pay on Delivery"
          : `Paid via ${order.payment_method}`,
      paymentCompleted: order.payment_status === "paid",
      totalAmount: order.total_amount,
      totalPaid: order.payment_status === "paid" ? order.total_amount : 0,
      totalPayable: order.total_amount,
      deliveryAddressLabel: address?.label ?? "Address",
      deliveryAddress: address?.fullAddress ?? "Address unavailable",
      itemTotal: pricing.item_total ?? 0,
      packagingFee: pricing.packaging_fee ?? 0,
      platformFee: pricing.platform_fee ?? 0,
      deliveryFee: pricing.delivery_fee ?? 0,
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
