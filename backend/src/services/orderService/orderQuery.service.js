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
  deliveryTime: kitchen.delivery_time || kitchen.deliveryTime,
});

const normalizeAddress = (address) => ({
  id: String(address._id),
  label: address.label,
  fullAddress: [
    address.address_line || address.addressLine,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", "),
  isDefault: Boolean(address.is_default || address.isDefault),
});

const normalizeOrder = (order) => ({
  id: String(order._id),
  userId: String(order.userId),
  kitchenId: String(order.kitchenId?._id ?? order.kitchenId),
  kitchenName: order.kitchenName,
  kitchenImageUrl: order.kitchenImageUrl,
  status: order.status,
  placedAt: order.placedAt,
  deliveredAt: order.deliveredAt,
  cancelledAt: order.cancelledAt,
  deliveryByTime: order.deliveryByTime,
  lastCancellationTime: order.lastCancellationTime,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  totalAmount: order.totalAmount,
  instructions: order.instructions,
  deliveryAddress: order.deliveryAddress || null,
  createdAt: order.createdAt,
});

const normalizeOrderItem = (item) => ({
  id: String(item._id),
  orderId: String(item.orderId),
  menuId: String(item.menuId),
  name: item.name,
  price: item.price,
  image: item.imageUrl,
  quantity: item.quantity,
});

const normalizeOrderPricing = (pricing) => ({
  id: String(pricing._id),
  orderId: String(pricing.orderId ?? pricing.order_id),
  itemTotal: pricing.itemTotal,
  packagingFee: pricing.packagingFee,
  platformFee: pricing.platformFee,
  discount: pricing.discount,
  deliveryFee: pricing.deliveryFee,
  tax: pricing.tax,
  finalTotal: pricing.finalTotal,
});

const normalizeOrderStatusHistory = (entry) => ({
  id: String(entry._id),
  orderId: String(entry.orderId),
  status: entry.status,
  message: entry.message,
  createdAt: entry.createdAt,
});

const assertOrderAccess = (order, actor = {}) => {
  if (actor.role === "admin") return;

  if (actor.role === "vendor" && actor.kitchenId) {
    if (String(order.kitchenId) !== String(actor.kitchenId)) {
      throw createHttpError("Unauthorized", 403);
    }
    return;
  }

  if (!actor.userId || String(order.userId) !== String(actor.userId)) {
    throw createHttpError("Unauthorized", 403);
  }
};

// Copy the current frontend profile-order joining logic into the backend
// and source its input arrays from MongoDB.
export const getUserProfileOrders = async (userId) => {
  const [orders, orderItems, orderPricing, orderStatusHistory, kitchens, addresses] =
    await Promise.all([
      Order.find({ userId: userId }).sort({ createdAt: -1 }).lean(),
      OrderItem.find().lean(),
      OrderPricing.find().lean(),
      OrderStatusHistory.find().sort({ createdAt: 1 }).lean(),
      Kitchen.find().lean(),
      UserAddress.find({ user_id: userId })
        .sort({ is_default: -1, createdAt: 1 })
        .lean(),
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

  if (actor.role === "vendor" && actor.kitchenId) {
    query.kitchenId = actor.kitchenId;
  } else if (actor.role !== "admin" && actor.userId) {
    query.userId = actor.userId;
  }

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.placedAt = {};
    if (dateFrom) query.placedAt.$gte = new Date(dateFrom);
    if (dateTo) query.placedAt.$lte = new Date(dateTo);
  }

  if (search) {
    query.kitchenName = { $regex: String(search), $options: "i" };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ placedAt: sort === "asc" ? 1 : -1 })
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
      OrderItem.find({ orderId: orderId }).lean(),
      OrderPricing.findOne({ orderId: orderId }).lean(),
      Payment.findOne({ orderId: orderId }).lean(),
      OrderStatusHistory.find({ orderId: orderId })
        .sort({ createdAt: 1 })
        .lean(),
      Order.findById(orderId).populate("kitchenId").lean(),
      actor.userId ? UserAddress.find({ user_id: actor.userId }).lean() : [],
    ]);

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  assertOrderAccess(order, actor);

  const normalizedKitchen = populatedOrder?.kitchenId?.name
    ? normalizeKitchen(populatedOrder.kitchenId)
    : null;
  const etaMins = calculateEtaMinutes(normalizedKitchen?.deliveryTime);

  const sanitizedPayment = payment
    ? {
        status: payment.status,
        method: payment.method,
        transactionId: payment.transactionId,
        amount: payment.amount,
        gateway: payment.gateway,
        paidAt: payment.paidAt,
      }
    : null;

  return {
    order: normalizeOrder(order),
    items: items.map(normalizeOrderItem),
    pricing: pricing ? normalizeOrderPricing(pricing) : null,
    payment: sanitizedPayment,
    statusHistory: statusHistory.map(normalizeOrderStatusHistory),
    kitchen: normalizedKitchen,
    addresses: addresses.map(normalizeAddress),
    delivery: estimateDeliveryTimeline({
      placedAt: order.placedAt,
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
