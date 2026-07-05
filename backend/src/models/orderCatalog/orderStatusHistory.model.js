import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema(
  {
    orderId: {
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
    createdAt: { type: Date, required: true },
  },
  { timestamps: false }
);

orderStatusHistorySchema.index({ orderId: 1, createdAt: 1 });

const OrderStatusHistory =
  mongoose.models.OrderStatusHistory ||
  mongoose.model("OrderStatusHistory", orderStatusHistorySchema);

export default OrderStatusHistory;
