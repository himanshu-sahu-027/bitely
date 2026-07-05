import mongoose from "mongoose";

const paymentItemSchema = new mongoose.Schema(
  {
    menuId: { type: mongoose.Schema.Types.Mixed, default: null },
    name: { type: String, trim: true, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    addressLine: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    landmark: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },

    // Kitchen snapshot stored at order time.
    kitchenName: { type: String, trim: true, required: true },
    kitchenImageUrl: { type: String, trim: true },

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
    orderStatus: {
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

    placedAt: { type: Date, required: true },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    deliveryByTime: { type: Date },
    lastCancellationTime: { type: Date },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "UPI", "Card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    totalAmount: { type: Number, required: true, min: 0 },
    instructions: { type: String, trim: true },
    items: {
      type: [paymentItemSchema],
      default: [],
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      default: () => ({}),
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ kitchenId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });
orderSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
