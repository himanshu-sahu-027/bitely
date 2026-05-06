import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    kitchen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KitchenFoodCategory",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

menuSchema.index({ kitchen_id: 1, category_id: 1 });

const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export default Menu;
