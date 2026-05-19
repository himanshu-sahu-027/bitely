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

    placed_at: { type: Date, required: true },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },

    delivery_by_time: { type: Date },
    last_cancellation_time: { type: Date },

    payment_method: {
      type: String,
      enum: ["UPI", "COD", "Card", "ONLINE"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "UPI", "Card"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    total_amount: { type: Number, required: true, min: 0 },
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
  { timestamps: { createdAt: "created_at", updatedAt: true } }
);

orderSchema.pre("validate", function syncPaymentFields(next) {
  this.user = this.user || this.user_id;
  this.user_id = this.user_id || this.user;

  this.paymentMethod = this.paymentMethod || this.payment_method;
  this.payment_method = this.payment_method || this.paymentMethod;

  this.paymentStatus = this.paymentStatus || this.payment_status;
  this.payment_status = this.payment_status || this.paymentStatus;

  this.totalAmount = this.totalAmount ?? this.total_amount;
  this.total_amount = this.total_amount ?? this.totalAmount;

  this.orderStatus = this.orderStatus || this.status;
  this.status = this.status || this.orderStatus;

  next();
});

orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ kitchen_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });
orderSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
