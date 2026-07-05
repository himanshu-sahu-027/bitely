import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    // Menu snapshot stored at order time.
    name: { type: String, trim: true, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },

    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

orderItemSchema.index({ orderId: 1 });

const OrderItem =
  mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
