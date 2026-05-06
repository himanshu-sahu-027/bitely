import Kitchen from "../../models/kitchenCatalog/kitchen.model.js";
import Menu from "../../models/kitchenCatalog/menu.model.js";
import { Cart, CartItem } from "../../models/orderCatalog/index.js";
import { createHttpError } from "../../utils/createHttpError.js";

export const getLatestUserCart = async (userId) =>
  Cart.findOne({ user_id: userId }).sort({ updatedAt: -1 });

export const clearCartItems = async (cartId) => {
  await CartItem.deleteMany({ cart_id: cartId });
};

// Enforce the same single-kitchen cart behavior the frontend currently uses.
export const getCartAndMenu = async ({ userId, menuId }) => {
  const menu = await Menu.findById(menuId).lean();

  if (!menu) {
    throw createHttpError("Menu item not found", 404);
  }

  let cart = await getLatestUserCart(userId);

  if (!cart) {
    cart = await Cart.create({
      user_id: userId,
      kitchen_id: menu.kitchen_id,
    });

    return { cart, menu };
  }

  const switchedKitchen =
    String(cart.kitchen_id) !== String(menu.kitchen_id);

  if (switchedKitchen) {
    cart.kitchen_id = menu.kitchen_id;
    cart.coupon_code = "";
    cart.instructions = "";
    await cart.save();
    await clearCartItems(cart._id);
  }

  return { cart, menu };
};

export const loadCartSnapshot = async (cartDoc) => {
  if (!cartDoc) {
    return {
      kitchen: null,
      cartItems: [],
      menuById: {},
    };
  }

  const [kitchen, cartItems] = await Promise.all([
    Kitchen.findById(cartDoc.kitchen_id).lean(),
    CartItem.find({ cart_id: cartDoc._id }).lean(),
  ]);
  const menus = await Menu.find({
    _id: { $in: cartItems.map((item) => item.menu_id) },
  }).lean();

  return {
    kitchen,
    cartItems,
    menuById: Object.fromEntries(
      menus.map((menu) => [String(menu._id), menu])
    ),
  };
};
