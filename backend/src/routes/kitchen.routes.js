import express from "express";

import {
  getFoodCategories,
  getFoods,
  getKitchenById,
  getKitchens,
  getKitchensByFood,
  getPopularFoods,
  searchFoodsAndKitchens,
} from "../controllers/kitchen.controller.js";

const router = express.Router();

router.get("/catalog/categories", getFoodCategories);
router.get("/catalog/foods", getFoods);
router.get("/catalog/popular-foods", getPopularFoods);

// Kitchen grid with optional filters and pagination.
router.get("/", getKitchens);

// Kitchens that can serve a specific food item.
router.get("/food/:foodId", getKitchensByFood);

// searching Foods And Kitchens in search bar
router.get("/search", searchFoodsAndKitchens);

// Single kitchen page payload with menu data.
router.get("/:kitchenId", getKitchenById);

export default router;
