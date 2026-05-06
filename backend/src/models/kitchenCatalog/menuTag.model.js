import mongoose from "mongoose";

const menuTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const MenuTag =
  mongoose.models.MenuTag || mongoose.model("MenuTag", menuTagSchema);

export default MenuTag;
