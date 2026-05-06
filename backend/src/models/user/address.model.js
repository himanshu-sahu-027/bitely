import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    label: String,
    address_line: String,
    city: String,
    state: String,
    pincode: String,

    latitude: Number,
    longitude: Number,

    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("UserAddress", addressSchema);