import mongoose from "mongoose";

const kitchenFoodCategorySchema = new mongoose.Schema(
  {
    kitchen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

kitchenFoodCategorySchema.index({ kitchen_id: 1, order: 1 }, { unique: true });

const KitchenFoodCategory =
  mongoose.models.KitchenFoodCategory ||
  mongoose.model("KitchenFoodCategory", kitchenFoodCategorySchema);

export default KitchenFoodCategory;
