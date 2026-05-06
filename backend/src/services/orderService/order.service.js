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

  const menuIds = items.map((item) => item.menu_id);
  const menus = await Menu.find({ _id: { $in: menuIds } }).lean();
  const menuById = Object.fromEntries(
    menus.map((menu) => [String(menu._id), menu])
  );

  return items.map((item) => {
    const menu = menuById[String(item.menu_id)];

    if (!menu) {
      throw createHttpError("Menu item not found", 404);
    }

    const quantity = Number.parseInt(item.quantity, 10);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createHttpError("Invalid item quantity", 400);
    }

    return {
      menu_id: menu._id,
      kitchen_id: menu.kitchen_id,
      name: menu.name,
      price: menu.price,
      image_url: menu.imageUrl,
      quantity,
    };
  });
};

export const prepareCreateOrderData = async ({
  userId,
  kitchen_id,
  payment_method,
  payment_status,
  instructions,
  items = [],
  pricing = {},
}) => {
  if (!kitchen_id || !payment_method) {
    throw createHttpError("Required fields missing", 400);
  }

  const kitchen = await Kitchen.findById(kitchen_id).lean();

  if (!kitchen) {
    throw createHttpError("Kitchen not found", 404);
  }

  const normalizedItems = await buildCreateOrderItems(items);

  if (
    normalizedItems.some(
      (item) => String(item.kitchen_id) !== String(kitchen._id)
    )
  ) {
    throw createHttpError(
      "All order items must belong to the same kitchen",
      400
    );
  }

  return {
    user_id: userId,
    kitchen_id: kitchen._id,
    kitchen_name: kitchen.name,
    kitchen_image_url: kitchen.imageUrl,
    payment_method,
    payment_status,
    instructions,
    items: normalizedItems.map(({ kitchen_id: _kitchenId, ...item }) => item),
    pricingInput: pricing,
  };
};

export const createOrder = async ({
  user_id,
  kitchen_id,
  kitchen_name,
  kitchen_image_url,
  payment_method,
  payment_status = "pending",
  instructions,
  items = [],
  pricingInput = {},
}) => {
  const pricing = calculatePriceBreakdown({
    items,
    ...pricingInput,
  });

  const order = await Order.create({
    user_id,
    kitchen_id,
    kitchen_name,
    kitchen_image_url,
    status: "placed",
    placed_at: new Date(),
    payment_method,
    payment_status,
    total_amount: pricing.final_total,
    instructions,
  });

  if (items.length > 0) {
    await OrderItem.insertMany(
      items.map((item) => ({
        order_id: order._id,
        menu_id: item.menu_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: item.quantity,
      }))
    );
  }

  await OrderPricing.create({
    order_id: order._id,
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
  order.cancelled_at = new Date();
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
