import ordersData from "../data/orders";
import orderItemsData from "../data/orderItems";
import orderPricingData from "../data/orderPricing";
import orderStatusHistoryData from "../data/orderStatusHistory";

const STORAGE_KEY = "bitely.dummyOrders";
const UPDATE_EVENT = "bitely:dummy-orders-updated";

const safeWindow = () => (typeof window !== "undefined" ? window : null);

function readStorage() {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return {
      orders: [],
      orderItems: [],
      orderPricing: [],
      orderStatusHistory: [],
    };
  }

  const stored = currentWindow.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      orders: [],
      orderItems: [],
      orderPricing: [],
      orderStatusHistory: [],
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    currentWindow.localStorage.removeItem(STORAGE_KEY);
    return {
      orders: [],
      orderItems: [],
      orderPricing: [],
      orderStatusHistory: [],
    };
  }
}

function writeStorage(payload) {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return;
  }

  currentWindow.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  currentWindow.dispatchEvent(new Event(UPDATE_EVENT));
}

function dedupeBy(list, key) {
  const seen = new Set();

  return list.filter((item) => {
    const value = item[key];

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

export function getMergedDummyOrderData() {
  const stored = readStorage();

  return {
    orders: dedupeBy([...stored.orders, ...ordersData], "id"),
    orderItems: dedupeBy([...stored.orderItems, ...orderItemsData], "id"),
    orderPricing: dedupeBy([...stored.orderPricing, ...orderPricingData], "id"),
    orderStatusHistory: dedupeBy(
      [...stored.orderStatusHistory, ...orderStatusHistoryData],
      "id",
    ),
  };
}

export function subscribeToDummyOrders(callback) {
  const currentWindow = safeWindow();

  if (!currentWindow) {
    return () => {};
  }

  currentWindow.addEventListener(UPDATE_EVENT, callback);

  return () => {
    currentWindow.removeEventListener(UPDATE_EVENT, callback);
  };
}

export function saveDummyOrder({
  order,
  items,
  pricing,
  paymentMethod,
  paymentStatus,
}) {
  const stored = readStorage();
  const orderId = order.id;

  const nextOrder = {
    id: orderId,
    user_id: order.user || "user_1",
    kitchen_id: order.kitchenId || "kit_dummy",
    kitchen_name: order.kitchenName || "Bitely Kitchen",
    kitchen_image:
      order.kitchenImage ||
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    status: order.orderStatus || "placed",
    placed_at: order.placedAt || new Date().toISOString(),
    delivered_at: null,
    cancelled_at: null,
    delivery_by_time:
      order.deliveryByTime ||
      new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    last_cancellation_time:
      order.lastCancellationTime ||
      new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    total_amount: order.totalAmount,
    instructions: order.instructions || "",
    created_at: order.placedAt || new Date().toISOString(),
  };

  const nextOrderItems = items.map((item, index) => ({
    id: `${orderId}_item_${index + 1}`,
    order_id: orderId,
    menu_id: item.id || item.menuId || `menu_dummy_${index + 1}`,
    name: item.name,
    price: item.price,
    image:
      item.image ||
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    quantity: item.quantity,
  }));

  const nextPricing = {
    id: `pricing_${orderId}`,
    order_id: orderId,
    item_total: pricing.itemTotal,
    packaging_fee: pricing.packagingFee,
    platform_fee: pricing.platformFee,
    discount: pricing.discount,
    delivery_fee: pricing.deliveryFee,
    tax: pricing.tax,
    final_total: pricing.finalTotal,
  };

  const nextHistory = [
    {
      id: `history_${orderId}_placed`,
      order_id: orderId,
      status: "placed",
      message: "Order placed successfully",
      created_at: order.placedAt || new Date().toISOString(),
    },
  ];

  writeStorage({
    orders: [
      nextOrder,
      ...stored.orders.filter((existingOrder) => existingOrder.id !== orderId),
    ],
    orderItems: [
      ...nextOrderItems,
      ...stored.orderItems.filter((item) => item.order_id !== orderId),
    ],
    orderPricing: [
      nextPricing,
      ...stored.orderPricing.filter((entry) => entry.order_id !== orderId),
    ],
    orderStatusHistory: [
      ...nextHistory,
      ...stored.orderStatusHistory.filter((entry) => entry.order_id !== orderId),
    ],
  });
}

export function saveProfileOrderPayment(order, paymentMethod, paymentStatus) {
  const placedAt = order.placedAt || order.date || new Date().toISOString();

  saveDummyOrder({
    order: {
      id: order.id,
      user: "user_1",
      kitchenId: order.kitchenId || "kit_dummy",
      kitchenName: order.kitchenName,
      kitchenImage: order.image,
      orderStatus: order.status,
      placedAt,
      deliveryByTime:
        order.deliveryByTime ||
        new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      lastCancellationTime:
        order.lastCancellationTime ||
        new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      totalAmount: order.totalAmount,
      instructions: order.instructions || "",
    },
    items: (order.items || []).map((item) => ({
      id: item.id || item.menu_id || item.menuId || item.name,
      menuId: item.menu_id || item.menuId || item.id,
      name: item.name,
      price: item.price || 0,
      image: item.image || "",
      quantity: item.quantity || item.qty || 1,
    })),
    pricing: {
      itemTotal: order.itemTotal || 0,
      packagingFee: order.packagingFee || 0,
      platformFee: order.platformFee || 0,
      discount: order.discountAmount || 0,
      deliveryFee: order.deliveryFee || 0,
      tax: order.taxes || 0,
      finalTotal: order.totalAmount || order.totalPayable || 0,
    },
    paymentMethod,
    paymentStatus,
  });
}
