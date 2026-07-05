import Kitchen from "../../models/kitchenCatalog/kitchen.model.js";
import Menu from "../../models/kitchenCatalog/menu.model.js";
import { Order, OrderItem, OrderPricing, OrderStatusHistory } from "../../models/orderCatalog/index.js";
import { createHttpError } from "../../utils/createHttpError.js";
import {
  buildStatusHistoryEntry,
  checkCancellationEligibility,
} from "./orderStatus.service.js";
import { calculatePriceBreakdown } from "./orderPricing.service.js";
import { buildOrderCancelledEvent, buildOrderPlacedEvent } from "./notification.service.js";

// Core order lifecycle operations.

const buildCreateOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("Order items are required", 400);
  }

  const menuIds = items.map((item) => item.menuId);
  const menus = await Menu.find({ _id: { $in: menuIds } }).lean();
  const menuById = Object.fromEntries(
    menus.map((menu) => [String(menu._id), menu])
  );

  return items.map((item) => {
    const menu = menuById[String(item.menuId)];

    if (!menu) {
      throw createHttpError("Menu item not found", 404);
    }

    const quantity = Number.parseInt(item.quantity, 10);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createHttpError("Invalid item quantity", 400);
    }

    return {
      menuId: menu._id,
      kitchenId: menu.kitchenId,
      name: menu.name,
      price: menu.price,
      imageUrl: menu.imageUrl,
      quantity,
    };
  });
};

export const prepareCreateOrderData = async ({
  userId,
  kitchenId,
  paymentMethod,
  paymentStatus,
  instructions,
  items = [],
  pricing = {},
}) => {
  if (!kitchenId || !paymentMethod) {
    throw createHttpError("Required fields missing", 400);
  }

  const kitchen = await Kitchen.findById(kitchenId).lean();

  if (!kitchen) {
    throw createHttpError("Kitchen not found", 404);
  }

  const normalizedItems = await buildCreateOrderItems(items);

  if (
    normalizedItems.some(
      (item) => String(item.kitchenId) !== String(kitchen._id)
    )
  ) {
    throw createHttpError("All order items must belong to the same kitchen", 400);
  }

  return {
    userId,
    kitchenId: kitchen._id,
    kitchenName: kitchen.name,
    kitchenImageUrl: kitchen.imageUrl,
    paymentMethod,
    paymentStatus,
    instructions,
    items: normalizedItems,
    pricingInput: pricing,
  };
};

export const createOrder = async ({
  userId,
  kitchenId,
  kitchenName,
  kitchenImageUrl,
  paymentMethod,
  paymentStatus = "pending",
  instructions,
  items = [],
  pricingInput = {},
}) => {
  // SECURITY: pricingInput must not be trusted from client.
  // Calculate pricing only from trusted item data (menu prices) and ignore client pricing fields.
  const pricing = calculatePriceBreakdown({
    items,
    // fallback to empty pricing input (no client overrides)
    pricingInput: {},
  });

  const order = await Order.create({
    userId,
    kitchenId,
    kitchenName,
    kitchenImageUrl,
    status: "placed",
    placedAt: new Date(),
    paymentMethod,
    paymentStatus,
    totalAmount: pricing.finalTotal,
    instructions,
  });

  if (items.length > 0) {
    await OrderItem.insertMany(
      items.map((item) => ({
        orderId: order._id,
        menuId: item.menuId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      }))
    );
  }

  await OrderPricing.create({
    orderId: order._id,
    ...pricing,
  });

  await OrderStatusHistory.create(
    buildStatusHistoryEntry({
      orderId: order._id,
      status: "placed",
      message: "Order placed successfully",
    })
  );

  return {
    order,
    event: buildOrderPlacedEvent(order),
  };
};

export const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  const cancellation = checkCancellationEligibility({ order });

  if (!cancellation.canCancel) {
    throw createHttpError(cancellation.reason, 400);
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  await order.save();

  await OrderStatusHistory.create(
    buildStatusHistoryEntry({
      orderId: order._id,
      status: "cancelled",
      message: "Order cancelled",
    })
  );

  return {
    order,
    cancellation,
    event: buildOrderCancelledEvent(order),
  };
};
