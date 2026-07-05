import mongoose from "mongoose";

const orderPricingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    itemTotal: { type: Number, required: true, min: 0 },
    packagingFee: { type: Number, default: 0, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    finalTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const OrderPricing =
  mongoose.models.OrderPricing ||
  mongoose.model("OrderPricing", orderPricingSchema);

export default OrderPricing;
