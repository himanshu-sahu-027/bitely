import { Menu } from "../../models/kitchenCatalog/index.js";
import { Order, OrderItem } from "../../models/orderCatalog/index.js";

// Rebuild a cart candidate from a historical order using the current catalog.
export const prepareReorder = async (orderId) => {
  const order = await Order.findById(orderId).lean();

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const orderItems = await OrderItem.find({ order_id: orderId }).lean();
  const menuIds = orderItems.map((item) => item.menu_id);
  const currentMenus = await Menu.find({ _id: { $in: menuIds } }).lean();
  const menuById = Object.fromEntries(
    currentMenus.map((menu) => [String(menu._id), menu])
  );

  return orderItems.map((item) => {
    const currentMenu = menuById[String(item.menu_id)];

    return {
      order_item_id: item._id,
      menu_id: item.menu_id,
      previous_name: item.name,
      previous_price: item.price,
      quantity: item.quantity,
      available: Boolean(currentMenu),
      latest_name: currentMenu?.name ?? null,
      latest_price: currentMenu?.price ?? null,
      latest_image_url: currentMenu?.imageUrl ?? null,
      substitution: null,
      disabled_reason: currentMenu ? null : "Menu item is no longer available",
    };
  });
};
