import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Ledger ownership
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

    // Gateway metadata (razorpay for now)
    gateway: { type: String, default: "razorpay" },
    gatewayOrderId: { type: String, default: null },
    gatewaySignature: { type: String, default: null },

    // Existing fields (keep + extend)
    method: {
      type: String,
      enum: ["UPI", "COD", "Card", "ONLINE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      required: true,
    },
    transactionId: { type: String, trim: true, default: null },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    failureReason: { type: String, default: null },

    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ gatewayOrderId: 1 }, { sparse: true });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
