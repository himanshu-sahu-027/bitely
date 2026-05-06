import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    message: { type: String, trim: true, required: true },
    created_at: { type: Date, required: true },
  },
  { timestamps: false }
);

orderStatusHistorySchema.index({ order_id: 1, created_at: 1 });

const OrderStatusHistory =
  mongoose.models.OrderStatusHistory ||
  mongoose.model("OrderStatusHistory", orderStatusHistorySchema);

export default OrderStatusHistory;
