import mongoose from "mongoose";

const menuImageSchema = new mongoose.Schema(
  {
    menu_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    imageUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const MenuImage =
  mongoose.models.MenuImage || mongoose.model("MenuImage", menuImageSchema);

export default MenuImage;
