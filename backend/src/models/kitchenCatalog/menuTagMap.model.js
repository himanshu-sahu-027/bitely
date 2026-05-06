import mongoose from "mongoose";

const menuTagMapSchema = new mongoose.Schema(
  {
    menu_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    tag_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuTag",
      required: true,
    },
  },
  { timestamps: true }
);

menuTagMapSchema.index({ menu_id: 1 });
menuTagMapSchema.index({ tag_id: 1 });
menuTagMapSchema.index({ menu_id: 1, tag_id: 1 }, { unique: true });

const MenuTagMap =
  mongoose.models.MenuTagMap ||
  mongoose.model("MenuTagMap", menuTagMapSchema);

export default MenuTagMap;
