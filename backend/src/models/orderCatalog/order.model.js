import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kitchen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },

    // Kitchen snapshot stored at order time.
    kitchen_name: { type: String, trim: true, required: true },
    kitchen_image_url: { type: String, trim: true },

    status: {
      type: String,
      enum: [
        "placed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    placed_at: { type: Date, required: true },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },

    delivery_by_time: { type: Date },
    last_cancellation_time: { type: Date },

    payment_method: {
      type: String,
      enum: ["UPI", "COD", "Card"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    total_amount: { type: Number, required: true, min: 0 },
    instructions: { type: String, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: true } }
);

orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ kitchen_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
