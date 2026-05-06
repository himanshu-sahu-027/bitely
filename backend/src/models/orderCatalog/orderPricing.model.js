import mongoose from "mongoose";

const orderPricingSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    item_total: { type: Number, required: true, min: 0 },
    packaging_fee: { type: Number, default: 0, min: 0 },
    platform_fee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    delivery_fee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    final_total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const OrderPricing =
  mongoose.models.OrderPricing ||
  mongoose.model("OrderPricing", orderPricingSchema);

export default OrderPricing;
