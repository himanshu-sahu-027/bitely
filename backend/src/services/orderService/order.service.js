import mongoose from "mongoose";

import Kitchen from "../../models/kitchenCatalog/kitchen.model.js";
import Menu from "../../models/kitchenCatalog/menu.model.js";
import {
  Order,
  OrderItem,
  OrderPricing,
  OrderStatusHistory,
  Payment,
} from "../../models/orderCatalog/index.js";
import { createHttpError } from "../../utils/createHttpError.js";
import {
  buildStatusHistoryEntry,
  checkCancellationEligibility,
} from "./orderStatus.service.js";
import { calculatePriceBreakdown } from "./orderPricing.service.js";
import { buildOrderCancelledEvent, buildOrderPlacedEvent } from "./notification.service.js";
import { createPayment } from "./payment.service.js";

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
      kitchenId: menu.kitchen_id,
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

  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      [order] = await Order.create(
        [
          {
            userId,
            kitchenId,
            kitchenName,
            kitchenImageUrl,
            status: "placed",
            orderStatus: "placed",
            placedAt: new Date(),
            paymentMethod,
            paymentStatus,
            totalAmount: pricing.finalTotal,
            instructions,
            items: items.map((item) => ({
              menuId: item.menuId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.imageUrl || "",
            })),
          },
        ],
        { session }
      );

      if (items.length > 0) {
        await OrderItem.insertMany(
          items.map((item) => ({
            orderId: order._id,
            menuId: item.menuId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
          })),
          { session }
        );
      }

      await OrderPricing.create(
        [
          {
            orderId: order._id,
            order_id: order._id,
            ...pricing,
          },
        ],
        { session }
      );

      await OrderStatusHistory.create(
        [
          buildStatusHistoryEntry({
            orderId: order._id,
            status: "placed",
            message: "Order placed successfully",
          }),
        ],
        { session }
      );

      await createPayment(
        {
          orderId: order._id,
          userId,
          kitchenId,
          gateway: paymentMethod === "COD" ? "cod" : "manual",
          gatewayOrderId: null,
          transactionId: null,
          gatewaySignature: null,
          amount: pricing.finalTotal,
          method: paymentMethod,
          currency: "INR",
          status: paymentStatus,
          paidAt: paymentStatus === "paid" ? new Date() : null,
        },
        session
      );
    });
  } finally {
    session.endSession();
  }

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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Re-fetch order/payment inside the transaction for consistency.
    const orderInTx = await Order.findById(orderId).session(session);
    if (!orderInTx) {
      throw createHttpError("Order not found", 404);
    }

    const cancellation = checkCancellationEligibility({ order: orderInTx });

    if (!cancellation.canCancel) {
      throw createHttpError(cancellation.reason, 400);
    }

    const paymentInTx = await Payment.findOne({ orderId }).session(session);

    // Enforce synchronization rules.
    if (paymentInTx?.status === "paid" || orderInTx.paymentStatus === "paid") {
      // No refund workflow exists yet; never overwrite payment state.
      const err = createHttpError(
        "Cannot cancel a paid order. Refund workflow is not implemented yet.",
        409
      );
      throw err;
    }

    if (paymentInTx?.status === "pending") {
      // pending -> cancelled
      orderInTx.paymentStatus = "cancelled";

      // Update payment ledger
      // Note: markPaymentCancelled() doesn't support session, so do the update here.
      paymentInTx.status = "cancelled";
      paymentInTx.failureReason = null;
      paymentInTx.paidAt = null;
      await paymentInTx.save({ session });
    } else if (
      paymentInTx?.status === "cancelled" ||
      paymentInTx?.status === "failed" ||
      paymentInTx?.status === "refunded"
    ) {
      // Leave Payment.status unchanged.
      // Cancellation updates Order.paymentStatus only for pending->cancelled rule;
      // if payment wasn't pending, do not modify further.
      // (If your existing architecture requires other mapping, that can be added later.)
    } else if (!paymentInTx && orderInTx.paymentStatus === "pending") {
      orderInTx.paymentStatus = "cancelled";
    }

    // Update order status + terminal timestamp invariants
    orderInTx.status = "cancelled";
    orderInTx.orderStatus = "cancelled";

    const now = new Date();
    orderInTx.cancelledAt = now;
    orderInTx.deliveredAt = null;

    await orderInTx.save({ session });

    // Insert history inside the transaction
    await OrderStatusHistory.create(
      [
        buildStatusHistoryEntry({
          orderId: orderInTx._id,
          status: "cancelled",
          message: "Order cancelled",
        }),
      ],
      { session }
    );

    await session.commitTransaction();

    const updatedOrder = orderInTx.toObject ? orderInTx.toObject() : orderInTx;

    return {
      order: updatedOrder,
      cancellation,
      event: buildOrderCancelledEvent(updatedOrder),
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
