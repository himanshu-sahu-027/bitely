import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import connectDB from "../src/config/db.js";
import User from "../src/models/user/user.model.js";
import {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderPricing,
  OrderStatusHistory,
  Payment,
} from "../src/models/orderCatalog/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDataDir = path.resolve(__dirname, "../../user-frontend/src/data");

const loadFrontendData = async (fileName) => {
  const filePath = path.join(frontendDataDir, fileName);
  const source = await fs.readFile(filePath, "utf8");

  const transformed = source
    .replace(
      /^import\s+(\w+)\s+from\s+["']([^"']+)["'];?\s*$/gm,
      (_, variableName, importPath) =>
        `const ${variableName} = "${importPath}";`
    )
    .replace(/export default\s+(\w+);?\s*$/m, "return $1;");

  const executor = new Function(transformed);
  return executor();
};

const createIdMap = (items) =>
  Object.fromEntries(items.map(({ id }) => [id, new mongoose.Types.ObjectId()]));

const clearOrderCatalogData = async () => {
  // Delete child collections first to avoid dependency issues.
  await CartItem.deleteMany({});
  await OrderItem.deleteMany({});
  await OrderPricing.deleteMany({});
  await OrderStatusHistory.deleteMany({});
  await Payment.deleteMany({});

  // Delete parent collections after dependents are gone.
  await Cart.deleteMany({});
  await Order.deleteMany({});
};

const ensureSeedUsers = async (userIds) => {
  const userIdMap = {};

  for (const userId of userIds) {
    const seedEmail = `${userId}@bitely.seed.local`;

    const user = await User.findOneAndUpdate(
      { email: seedEmail },
      {
        $set: {
          name: "Seed User",
          email: seedEmail,
          authProvider: "email",
          isVerified: true,
          is_active: true,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    userIdMap[userId] = user._id;
  }

  return userIdMap;
};

const seedOrderCatalog = async () => {
  const [
    cartsData,
    cartItemsData,
    ordersData,
    orderItemsData,
    orderPricingData,
    orderStatusHistoryData,
    paymentsData,
  ] = await Promise.all([
    loadFrontendData("carts.js"),
    loadFrontendData("cartItems.js"),
    loadFrontendData("orders.js"),
    loadFrontendData("orderItems.js"),
    loadFrontendData("orderPricing.js"),
    loadFrontendData("orderStatusHistory.js"),
    loadFrontendData("payment.js"),
  ]);

  const cartIds = createIdMap(cartsData);
  const cartItemIds = createIdMap(cartItemsData);
  const orderIds = createIdMap(ordersData);
  const orderItemIds = createIdMap(orderItemsData);
  const orderPricingIds = createIdMap(orderPricingData);
  const orderStatusHistoryIds = createIdMap(orderStatusHistoryData);
  const paymentIds = createIdMap(paymentsData);

  // These ids come from frontend dummy data and are converted into Mongo ObjectIds
  // for cross-document relations in the order domain.
  const kitchenIds = Object.fromEntries(
    [...new Set([...cartsData, ...ordersData].map((item) => item.kitchen_id))].map(
      (id) => [id, new mongoose.Types.ObjectId()]
    )
  );

  const menuIds = Object.fromEntries(
    [
      ...new Set(
        [...cartItemsData, ...orderItemsData].map((item) => item.menu_id)
      ),
    ].map((id) => [id, new mongoose.Types.ObjectId()])
  );

  await connectDB();
  const userIds = await ensureSeedUsers(
    [...new Set([...cartsData, ...ordersData].map((item) => item.user_id))]
  );
  await clearOrderCatalogData();

  const carts = cartsData.map(
    ({
      id,
      user_id,
      kitchen_id,
      coupon_code,
      instructions,
      created_at,
      updated_at,
    }) => ({
      _id: cartIds[id],
      user_id: userIds[user_id],
      kitchen_id: kitchenIds[kitchen_id],
      coupon_code,
      instructions,
      createdAt: created_at ? new Date(created_at) : undefined,
      updatedAt: updated_at ? new Date(updated_at) : undefined,
    })
  );

  const cartItems = cartItemsData.map(
    ({ id, cart_id, menu_id, quantity, price_at_time }) => ({
      _id: cartItemIds[id],
      cart_id: cartIds[cart_id],
      menu_id: menuIds[menu_id],
      quantity,
      price_at_time,
    })
  );

  const orders = ordersData.map(
    ({
      id,
      user_id,
      kitchen_id,
      kitchen_name,
      kitchen_image,
      status,
      placed_at,
      delivered_at,
      cancelled_at,
      delivery_by_time,
      last_cancellation_time,
      payment_method,
      payment_status,
      total_amount,
      instructions,
      created_at,
    }) => ({
      _id: orderIds[id],
      user_id: userIds[user_id],
      kitchen_id: kitchenIds[kitchen_id],
      kitchen_name,
      kitchen_image_url: kitchen_image,
      status,
      placed_at: new Date(placed_at),
      delivered_at: delivered_at ? new Date(delivered_at) : null,
      cancelled_at: cancelled_at ? new Date(cancelled_at) : null,
      delivery_by_time: delivery_by_time ? new Date(delivery_by_time) : null,
      last_cancellation_time: last_cancellation_time
        ? new Date(last_cancellation_time)
        : null,
      payment_method,
      payment_status,
      total_amount,
      instructions,
      created_at: created_at ? new Date(created_at) : new Date(placed_at),
    })
  );

  const orderItems = orderItemsData.map(
    ({ id, order_id, menu_id, name, price, image, quantity }) => ({
      _id: orderItemIds[id],
      order_id: orderIds[order_id],
      menu_id: menuIds[menu_id],
      name,
      price,
      image_url: image,
      quantity,
    })
  );

  const orderPricing = orderPricingData.map(
    ({
      id,
      order_id,
      item_total,
      packaging_fee,
      platform_fee,
      discount,
      delivery_fee,
      tax,
      final_total,
    }) => ({
      _id: orderPricingIds[id],
      order_id: orderIds[order_id],
      item_total,
      packaging_fee,
      platform_fee,
      discount,
      delivery_fee,
      tax,
      final_total,
    })
  );

  const orderStatusHistory = orderStatusHistoryData.map(
    ({ id, order_id, status, message, created_at }) => ({
      _id: orderStatusHistoryIds[id],
      order_id: orderIds[order_id],
      status,
      message,
      created_at: new Date(created_at),
    })
  );

  const payments = paymentsData.map(
    ({ id, order_id, method, status, transaction_id, amount, paid_at }) => ({
      _id: paymentIds[id],
      order_id: orderIds[order_id],
      method,
      status,
      transaction_id,
      amount,
      paid_at: paid_at ? new Date(paid_at) : null,
    })
  );

  try {
    await Cart.insertMany(carts);
    await CartItem.insertMany(cartItems);
    await Order.insertMany(orders);
    await OrderItem.insertMany(orderItems);
    await OrderPricing.insertMany(orderPricing);
    await OrderStatusHistory.insertMany(orderStatusHistory);
    await Payment.insertMany(payments);
  } catch (error) {
    console.error("Insert failed", error);
    throw error;
  }

  console.log("Order catalog seed completed");
  console.log(
    JSON.stringify(
      {
        carts: carts.length,
        cartItems: cartItems.length,
        orders: orders.length,
        orderItems: orderItems.length,
        orderPricing: orderPricing.length,
        orderStatusHistory: orderStatusHistory.length,
        payments: payments.length,
      },
      null,
      2
    )
  );
};

seedOrderCatalog()
  .catch((error) => {
    console.error("Order catalog seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
