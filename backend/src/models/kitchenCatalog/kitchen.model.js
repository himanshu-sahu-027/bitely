import mongoose from "mongoose";

const kitchenSchema = new mongoose.Schema(
  {
    owner_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    delivery_time: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    last_order_time: { type: String, trim: true },
  },
  { timestamps: true }
);

const Kitchen =
  mongoose.models.Kitchen || mongoose.model("Kitchen", kitchenSchema);

export default Kitchen;
