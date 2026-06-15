import express from "express";

import {
  addKitchenReview,
  getKitchenReviews,
  addFoodReview,
  getFoodReviews,
  updateKitchenReview,
  deleteKitchenReview,
  updateFoodReview,
  deleteFoodReview,
} from "../controllers/review.controller.js";


import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/kitchen/:kitchenId",
  protect,
  addKitchenReview
);

router.get(
  "/kitchen/:kitchenId",
  getKitchenReviews
);

router.put(
  "/kitchen/:reviewId",
  protect,
  updateKitchenReview
);

router.delete(
  "/kitchen/:reviewId",
  protect,
  deleteKitchenReview
);

router.post(
  "/food/:menuId",
  protect,
  addFoodReview
);

router.get(
  "/food/:menuId",
  getFoodReviews
);

router.put(
  "/food/:reviewId",
  protect,
  updateFoodReview
);

router.delete(
  "/food/:reviewId",
  protect,
  deleteFoodReview
);

export default router;
