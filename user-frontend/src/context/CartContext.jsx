/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

import {
  addCartItem,
  applyCartCoupon,
  clearCartRequest,
  fetchCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const EMPTY_CART = {
  id: null,
  restaurant: null,
  items: [],
  coupon: {
    code: "",
    discount: 0,
    applied: false,
    error: "",
  },
  pricing: {
    itemTotal: 0,
    deliveryFee: 0,
    platformFee: 0,
    gst: 0,
    discount: 0,
    total: 0,
  },
};

function readGuestCart() {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const saved = window.localStorage.getItem("bitely.cart");
    return saved ? JSON.parse(saved) : EMPTY_CART;
  } catch {
    window.localStorage.removeItem("bitely.cart");
    return EMPTY_CART;
  }
}

function calculateGuestPricing(cart) {
  const itemTotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const gst = itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0;
  const deliveryFee = itemTotal > 0 ? 30 : 0;
  const discount = cart.coupon?.applied ? cart.coupon.discount : 0;

  return {
    itemTotal,
    deliveryFee,
    platformFee: 0,
    gst,
    discount,
    total: Math.max(itemTotal + deliveryFee + gst - discount, 0),
  };
}

function withGuestPricing(cart) {
  return {
    ...cart,
    pricing: calculateGuestPricing(cart),
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => withGuestPricing(readGuestCart()));
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isAuthenticated) {
      return;
    }

    window.localStorage.setItem("bitely.cart", JSON.stringify(cart));
  }, [cart, isAuthenticated]);

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      if (!isAuthenticated) {
        setCart(withGuestPricing(readGuestCart()));
        return;
      }

      setIsCartLoading(true);

      try {
        const response = await fetchCart();

        if (!ignore) {
          setCart(response.data);
        }
      } catch {
        if (!ignore) {
          setCart(EMPTY_CART);
        }
      } finally {
        if (!ignore) {
          setIsCartLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const updateGuestCart = (updater) => {
    setCart((previousCart) => withGuestPricing(updater(previousCart)));
  };

  const syncServerCart = async (request) => {
    setIsCartLoading(true);

    try {
      const response = await request();
      setCart(response.data);
      return response.data;
    } finally {
      setIsCartLoading(false);
    }
  };

  const addToCart = async (restaurant, item) => {
    if (isAuthenticated) {
      return syncServerCart(() =>
        addCartItem({
          menu_id: item.id,
          quantity: 1,
        }),
      );
    }

    updateGuestCart((previousCart) => {
      if (
        previousCart.restaurant &&
        previousCart.restaurant.id !== restaurant.id
      ) {
        return {
          ...EMPTY_CART,
          restaurant,
          items: [{ ...item, quantity: 1 }],
        };
      }

      const existingItem = previousCart.items.find(
        (currentItem) => currentItem.id === item.id,
      );

      const nextItems = existingItem
        ? previousCart.items.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, quantity: currentItem.quantity + 1 }
              : currentItem,
          )
        : [...previousCart.items, { ...item, quantity: 1 }];

      return {
        ...previousCart,
        restaurant,
        items: nextItems,
      };
    });
  };

  const updateQuantity = async (itemId, change) => {
    const existingItem = cart.items.find((item) => item.id === itemId);

    if (!existingItem) {
      return;
    }

    if (isAuthenticated) {
      const nextQuantity = Math.max(existingItem.quantity + change, 0);

      return syncServerCart(() =>
        updateCartItem(itemId, {
          quantity: nextQuantity,
        }),
      );
    }

    updateGuestCart((previousCart) => {
      const currentItem = previousCart.items.find((item) => item.id === itemId);

      if (!currentItem) {
        return previousCart;
      }

      const nextQuantity = currentItem.quantity + change;
      const nextItems =
        nextQuantity <= 0
          ? previousCart.items.filter((item) => item.id !== itemId)
          : previousCart.items.map((item) =>
              item.id === itemId ? { ...item, quantity: nextQuantity } : item,
            );

      return {
        ...previousCart,
        restaurant: nextItems.length > 0 ? previousCart.restaurant : null,
        items: nextItems,
      };
    });
  };

  const removeFromCart = async (itemId) => updateQuantity(itemId, -1);

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      return syncServerCart(() => removeCartItem(itemId));
    }

    updateGuestCart((previousCart) => {
      const nextItems = previousCart.items.filter((item) => item.id !== itemId);

      return {
        ...previousCart,
        restaurant: nextItems.length > 0 ? previousCart.restaurant : null,
        items: nextItems,
      };
    });
  };

  const applyCoupon = async (code, itemTotal) => {
    if (isAuthenticated) {
      return syncServerCart(() =>
        applyCartCoupon({
          code,
        }),
      );
    }

    const formattedCode = code.trim().toUpperCase();
    const rules = {
      BITELY50: { discount: 50, min: 200 },
      SAVE100: { discount: 100, min: 400 },
    };
    const rule = rules[formattedCode];

    updateGuestCart((previousCart) => {
      if (!formattedCode) {
        return {
          ...previousCart,
          coupon: {
            code: "",
            discount: 0,
            applied: false,
            error: "Enter a code",
          },
        };
      }

      if (!rule) {
        return {
          ...previousCart,
          coupon: {
            code: formattedCode,
            discount: 0,
            applied: false,
            error: "Invalid code",
          },
        };
      }

      if (itemTotal < rule.min) {
        return {
          ...previousCart,
          coupon: {
            code: formattedCode,
            discount: 0,
            applied: false,
            error: `Add Rs. ${rule.min} to use this coupon`,
          },
        };
      }

      return {
        ...previousCart,
        coupon: {
          code: formattedCode,
          discount: rule.discount,
          applied: true,
          error: "",
        },
      };
    });
  };

  const removeCoupon = async () => {
    if (isAuthenticated) {
      return syncServerCart(() => removeCartCoupon());
    }

    updateGuestCart((previousCart) => ({
      ...previousCart,
      coupon: {
        code: "",
        discount: 0,
        applied: false,
        error: "",
      },
    }));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      return syncServerCart(() => clearCartRequest());
    }

    setCart(EMPTY_CART);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
