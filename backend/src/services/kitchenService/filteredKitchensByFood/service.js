import mongoose from "mongoose";

import { Kitchen } from "../../../models/kitchenCatalog/index.js";
import {
  applyKitchenGridFilters,
  buildKitchenFilterMetadata,
  defaultKitchenFilters,
} from "../filterKitchenGridItems/service.js";
import {
  normalizeCategory,
  normalizeFood,
  normalizeKitchen,
  normalizeMenu,
  normalizeMenuTag,
  normalizeMenuTagMap,
} from "./normalizers.js";
import { loadFilteredKitchensByFoodSourceData } from "./queries.js";
import { paginateArray } from "../../../utils/pagination.js";
import {
  attachMatchedMenuImage,
  getCurrentFoodCategorySlug,
} from "./builders.js";

// Main kitchens-by-food query service.
// This stays intentionally small and delegates normalization and data shaping
// to helper modules inside the filteredKitchensByFood folder.
export async function getFilteredKitchensByFood(foodId, filters = {}) {
  if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
    return [];
  }

  // Match the frontend behavior by merging custom filters with defaults.
  const safeFilters = {
    ...defaultKitchenFilters,
    ...filters,
  };

  const {
    currentFood,
    filteredMenuDocs,
    foodsDocs,
    categoryDocs,
    menuTagDocs,
    menuTagMapDocs,
  } = await loadFilteredKitchensByFoodSourceData(foodId);

  if (!currentFood) {
    return [];
  }

  // Normalize Mongo documents into the same shape the old frontend query expected.
  const foods = foodsDocs.map(normalizeFood);
  const categories = categoryDocs.map(normalizeCategory);
  const filteredMenus = filteredMenuDocs.map(normalizeMenu);
  const menuTags = menuTagDocs.map(normalizeMenuTag);
  const menuTagMap = menuTagMapDocs.map(normalizeMenuTagMap);

  const currentCategorySlug = getCurrentFoodCategorySlug({
    currentFood,
    foods,
    categories,
  });

  // Preserve the frontend shortcut: if the selected food's category conflicts
  // with the chosen category filters, return nothing immediately.
  if (
    safeFilters.categories.length > 0 &&
    currentCategorySlug &&
    !safeFilters.categories.includes(currentCategorySlug)
  ) {
    return [];
  }

  // Same unique-kitchen extraction logic used in the frontend.
  const kitchenIds = [...new Set(filteredMenus.map((menu) => menu.kitchenId))];
  const matchedKitchenDocs = await Kitchen.find({ _id: { $in: kitchenIds } }).lean();
  const matchedKitchens = matchedKitchenDocs.map(normalizeKitchen);

  const kitchensWithFilterMetadata = buildKitchenFilterMetadata({
    kitchens: matchedKitchens,
    menus: filteredMenus,
    foods,
    categories,
    menuTags,
    menuTagMap,
  });

  const kitchensWithPreviewImage = attachMatchedMenuImage(
    kitchensWithFilterMetadata,
    filteredMenus
  );

  // Reuse the exact same kitchen-grid filter logic as the frontend.
  return applyKitchenGridFilters(kitchensWithPreviewImage, safeFilters);
}

export async function getFilteredKitchensByFoodPage(
  foodId,
  filters = {},
  pagination
) {
  const kitchens = await getFilteredKitchensByFood(foodId, filters);
  return paginateArray(kitchens, pagination);
}
