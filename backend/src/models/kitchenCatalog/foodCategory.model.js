import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, trim: true },
  },
  { timestamps: true }
);

const FoodCategory =
  mongoose.models.FoodCategory ||
  mongoose.model("FoodCategory", foodCategorySchema);

export default FoodCategory;
