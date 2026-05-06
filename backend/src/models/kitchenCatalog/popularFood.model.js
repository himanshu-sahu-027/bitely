import mongoose from "mongoose";

const popularFoodSchema = new mongoose.Schema(
  {
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    imageUrl: { type: String, trim: true },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const PopularFood =
  mongoose.models.PopularFood ||
  mongoose.model("PopularFood", popularFoodSchema);

export default PopularFood;
