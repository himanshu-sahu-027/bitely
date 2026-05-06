import Kitchen from "../../models/kitchenCatalog/kitchen.model.js";
import UserAddress from "../../models/user/address.model.js";
import {
  Order,
  OrderItem,
  OrderPricing,
  OrderStatusHistory,
  Payment,
} from "../../models/orderCatalog/index.js";
import buildProfileOrders from "./buildProfileOrders.js";
import { buildPaginationMeta, paginateArray } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";
import {
  calculateEtaMinutes,
  estimateDeliveryTimeline,
} from "./delivery.service.js";

const normalizeKitchen = (kitchen) => ({
  id: String(kitchen._id),
  name: kitchen.name,
  image: kitchen.imageUrl,
  address: kitchen.address,
  deliveryTime: kitchen.delivery_time,
});

const normalizeAddress = (address) => ({
  id: String(address._id),
  label: address.label,
  fullAddress: [address.address_line, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", "),
  is_default: address.is_default,
});

const normalizeOrder = (order) => ({
  id: String(order._id),
  user_id: String(order.user_id),
  kitchen_id: String(order.kitchen_id?._id ?? order.kitchen_id),
  kitchen_name: order.kitchen_name,
  kitchen_image: order.kitchen_image_url,
  status: order.status,
  placed_at: order.placed_at,
  delivered_at: order.delivered_at,
  cancelled_at: order.cancelled_at,
  delivery_by_time: order.delivery_by_time,
  last_cancellation_time: order.last_cancellation_time,
  payment_method: order.payment_method,
  payment_status: order.payment_status,
  total_amount: order.total_amount,
  instructions: order.instructions,
  created_at: order.created_at,
});

const normalizeOrderItem = (item) => ({
  id: String(item._id),
  order_id: String(item.order_id),
  menu_id: String(item.menu_id),
  name: item.name,
  price: item.price,
  image: item.image_url,
  quantity: item.quantity,
});

const normalizeOrderPricing = (pricing) => ({
  id: String(pricing._id),
  order_id: String(pricing.order_id),
  item_total: pricing.item_total,
  packaging_fee: pricing.packaging_fee,
  platform_fee: pricing.platform_fee,
  discount: pricing.discount,
  delivery_fee: pricing.delivery_fee,
  tax: pricing.tax,
  final_total: pricing.final_total,
});

const normalizeOrderStatusHistory = (entry) => ({
  id: String(entry._id),
  order_id: String(entry.order_id),
  status: entry.status,
  message: entry.message,
  created_at: entry.created_at,
});

const assertOrderAccess = (order, actor = {}) => {
  if (actor.role === "admin") return;

  if (actor.role === "vendor" && actor.kitchen_id) {
    if (String(order.kitchen_id) !== String(actor.kitchen_id)) {
      throw createHttpError("Unauthorized", 403);
    }
    return;
  }

  if (!actor.user_id || String(order.user_id) !== String(actor.user_id)) {
    throw createHttpError("Unauthorized", 403);
  }
};

// Copy the current frontend profile-order joining logic into the backend
// and source its input arrays from MongoDB.
export const getUserProfileOrders = async (userId) => {
  const [orders, orderItems, orderPricing, orderStatusHistory, kitchens, addresses] =
    await Promise.all([
      Order.find({ user_id: userId }).sort({ created_at: -1 }).lean(),
      OrderItem.find().lean(),
      OrderPricing.find().lean(),
      OrderStatusHistory.find().sort({ created_at: 1 }).lean(),
      Kitchen.find().lean(),
      UserAddress.find({ user_id: userId }).sort({ is_default: -1, createdAt: 1 }).lean(),
    ]);

  return buildProfileOrders({
    orders: orders.map(normalizeOrder),
    orderItems: orderItems.map(normalizeOrderItem),
    orderPricing: orderPricing.map(normalizeOrderPricing),
    orderStatusHistory: orderStatusHistory.map(normalizeOrderStatusHistory),
    kitchens: kitchens.map(normalizeKitchen),
    addresses: addresses.map(normalizeAddress),
  });
};

export const listOrders = async ({
  actor = {},
  status,
  search,
  dateFrom,
  dateTo,
  page = 1,
  limit = 10,
  sort = "desc",
} = {}) => {
  const query = {};

  if (actor.role === "vendor" && actor.kitchen_id) {
    query.kitchen_id = actor.kitchen_id;
  } else if (actor.role !== "admin" && actor.user_id) {
    query.user_id = actor.user_id;
  }

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.placed_at = {};
    if (dateFrom) query.placed_at.$gte = new Date(dateFrom);
    if (dateTo) query.placed_at.$lte = new Date(dateTo);
  }

  if (search) {
    query.kitchen_name = { $regex: String(search), $options: "i" };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ placed_at: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    data: orders.map(normalizeOrder),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
};

export const getOrderDetails = async ({ orderId, actor = {} }) => {
  const [order, items, pricing, payment, statusHistory, populatedOrder, addresses] =
    await Promise.all([
      Order.findById(orderId).lean(),
      OrderItem.find({ order_id: orderId }).lean(),
      OrderPricing.findOne({ order_id: orderId }).lean(),
      Payment.findOne({ order_id: orderId }).lean(),
      OrderStatusHistory.find({ order_id: orderId }).sort({ created_at: 1 }).lean(),
      Order.findById(orderId).populate("kitchen_id").lean(),
      actor.user_id ? UserAddress.find({ user_id: actor.user_id }).lean() : [],
    ]);

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  assertOrderAccess(order, actor);

  const normalizedKitchen = populatedOrder?.kitchen_id?.name
    ? normalizeKitchen(populatedOrder.kitchen_id)
    : null;
  const etaMins = calculateEtaMinutes(normalizedKitchen?.deliveryTime);

  return {
    order: normalizeOrder(order),
    items: items.map(normalizeOrderItem),
    pricing: pricing ? normalizeOrderPricing(pricing) : null,
    payment,
    statusHistory: statusHistory.map(normalizeOrderStatusHistory),
    kitchen: normalizedKitchen,
    addresses: addresses.map(normalizeAddress),
    delivery: estimateDeliveryTimeline({
      placedAt: order.placed_at,
      etaMins,
    }),
  };
};

export const splitActiveAndPastOrders = (ordersByStatus) => ({
  active: ordersByStatus.active,
  past: ordersByStatus.past,
});

export const paginateProfileOrders = (items, pagination) =>
  paginateArray(items, pagination);
