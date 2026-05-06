import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    menu_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price_at_time: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

cartItemSchema.index({ cart_id: 1, menu_id: 1 }, { unique: true });

const CartItem =
  mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);

export default CartItem;
