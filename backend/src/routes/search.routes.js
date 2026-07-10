import express from "express";

import {
  search,
  searchMenuKitchens,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", search);
router.get("/menu/:slug", searchMenuKitchens);

export default router;

