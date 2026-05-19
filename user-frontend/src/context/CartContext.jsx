import { createContext, useContext, useState, useEffect } from "react";

// Create Context
const CartContext = createContext();

// Provider Component (wraps your app)
export function CartProvider({ children }) {
  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("bitely.cart");

    if (saved) {
      return JSON.parse(saved);
    }

    return {
      restaurant: null,
      items: [],
      coupon: {
        code: "",
        discount: 0,
        applied: false,
        error: "",
      },
    };
  });

  useEffect(() => {
    localStorage.setItem("bitely.cart", JSON.stringify(cart));
  }, [cart]);

  //  ADD ITEM TO CART
  const addToCart = (restaurant, item) => {
    setCart((prev) => {
      //  If user selects a different restaurant, reset cart
      if (prev.restaurant && prev.restaurant.id !== restaurant.id) {
        return {
          restaurant,
          items: [{ ...item, quantity: 1 }],
        };
      }

      //  Check if item already exists
      const existingItem = prev.items.find((i) => i.id === item.id);

      let updatedItems;

      if (existingItem) {
        //  Increase quantity
        updatedItems = prev.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      } else {
        //  Add new item
        updatedItems = [...prev.items, { ...item, quantity: 1 }];
      }

      return {
        ...prev,
        restaurant,
        items: updatedItems,
      };
    });
  };

  //  UPDATE QUANTITY (+ or -)
  const updateQuantity = (itemId, change) => {
    setCart((prev) => {
      const existing = prev.items.find((item) => item.id === itemId);

      //  If item not found, do nothing
      if (!existing) return prev;

      let updatedItems;

      if (change > 0) {
        // + Increase quantity
        updatedItems = prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        // - Decrease quantity
        if (existing.quantity === 1) {
          //  Remove item if quantity becomes 0
          updatedItems = prev.items.filter((item) => item.id !== itemId);
        } else {
          updatedItems = prev.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          );
        }
      }

      return {
        ...prev,
        restaurant: updatedItems.length > 0 ? prev.restaurant : null,
        items: updatedItems,
      };
    });
  };

  //  REMOVE ONE QUANTITY FROM CART
  const removeFromCart = (itemId) => {
    updateQuantity(itemId, -1);
  };

  //  REMOVE ITEM COMPLETELY
  const removeItem = (itemId) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);

      return {
        ...prev,
        restaurant: updatedItems.length > 0 ? prev.restaurant : null,
        items: updatedItems,
      };
    });
  };

  // apply coupon
  const applyCoupon = (code, itemTotal) => {
    const formatted = code.trim().toUpperCase();

    const rules = {
      BITELY50: { discount: 50, min: 200 },
      SAVE100: { discount: 100, min: 400 },
    };

    const rule = rules[formatted];

    if (!formatted) {
      setCart((prev) => ({
        ...prev,
        coupon: {
          code: "",
          discount: 0,
          applied: false,
          error: "Enter a code",
        },
      }));
      return;
    }

    if (!rule) {
      setCart((prev) => ({
        ...prev,
        coupon: {
          code: formatted,
          discount: 0,
          applied: false,
          error: "Invalid code",
        },
      }));
      return;
    }

    if (itemTotal < rule.min) {
      setCart((prev) => ({
        ...prev,
        coupon: {
          code: formatted,
          discount: 0,
          applied: false,
          error: `Add ₹${rule.min} to use this coupon`,
        },
      }));
      return;
    }

    setCart((prev) => ({
      ...prev,
      coupon: {
        code: formatted,
        discount: rule.discount,
        applied: true,
        error: "",
      },
    }));
  };

  // remove coupon
  const removeCoupon = () => {
    setCart((prev) => ({
      ...prev,
      coupon: { code: "", discount: 0, applied: false, error: "" },
    }));
  };

  const clearCart = () => {
    setCart({
      restaurant: null,
      items: [],
      coupon: {
        code: "",
        discount: 0,
        applied: false,
        error: "",
      },
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
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

// Custom hook for easy usage
export const useCart = () => useContext(CartContext);
