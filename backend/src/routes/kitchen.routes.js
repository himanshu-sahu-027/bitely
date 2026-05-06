import express from "express";

import {
  getKitchenById,
  getKitchens,
  getKitchensByFood,
} from "../controllers/kitchen.controller.js";

const router = express.Router();

// Kitchen grid with optional filters and pagination.
router.get("/", getKitchens);

// Kitchens that can serve a specific food item.
router.get("/food/:foodId", getKitchensByFood);

// Single kitchen page payload with menu data.
router.get("/:kitchenId", getKitchenById);

export default router;
