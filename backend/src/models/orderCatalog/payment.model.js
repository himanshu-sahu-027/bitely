import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: {
      type: String,
      enum: ["UPI", "COD", "Card"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      required: true,
    },
    transaction_id: { type: String, trim: true, default: null },
    amount: { type: Number, required: true, min: 0 },
    paid_at: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ order_id: 1 });
paymentSchema.index({ transaction_id: 1 }, { sparse: true });

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
