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

  const orderItems = await OrderItem.find({ orderId: orderId }).lean();
  const menuIds = orderItems.map((item) => item.menuId);
  const currentMenus = await Menu.find({ _id: { $in: menuIds } }).lean();
  const menuById = Object.fromEntries(
    currentMenus.map((menu) => [String(menu._id), menu])
  );

  return orderItems.map((item) => {
    const currentMenu = menuById[String(item.menuId)];

    return {
      orderItemId: item._id,
      menuId: item.menuId,
      previousName: item.name,
      previousPrice: item.price,
      quantity: item.quantity,
      available: Boolean(currentMenu),
      latestName: currentMenu?.name ?? null,
      latestPrice: currentMenu?.price ?? null,
      latestImageUrl: currentMenu?.imageUrl ?? null,
      substitution: null,
      disabledReason: currentMenu
        ? null
        : "Menu item is no longer available",
    };
  });
};
