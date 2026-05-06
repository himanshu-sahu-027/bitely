import mongoose from "mongoose";

import {
  defaultKitchenCategories,
} from "./constants.js";
import {
  normalizeKitchen,
  normalizeMenu,
  normalizeMenuImage,
  normalizeMenuTag,
  normalizeMenuTagMap,
} from "./normalizers.js";
import { loadKitchenPageSourceData } from "./queries.js";
import {
  buildKitchenMenus,
  filterKitchenMenuItems,
  buildVisibleKitchenMenuItems,
} from "./builders.js";

// Main kitchen page query service.
// This stays small on purpose and delegates data loading and transformation
// to focused helpers inside the loadkitchenPage folder.
export async function getKitchenPageData(
  kitchenId,
  selectedCategory = defaultKitchenCategories[0]
) {
  // Validate incoming ids here so controller code can stay lean.
  if (!kitchenId || !mongoose.Types.ObjectId.isValid(kitchenId)) {
    const error = new Error("Invalid kitchen id");
    error.statusCode = 400;
    throw error;
  }

  const {
    kitchenDoc,
    menuDocs,
    menuImageDocs,
    menuTagDocs,
    menuTagMapDocs,
  } = await loadKitchenPageSourceData(kitchenId);

  // Report missing kitchens from the service layer so controllers stay clean.
  if (!kitchenDoc) {
    const error = new Error("Kitchen not found");
    error.statusCode = 404;
    throw error;
  }

  // Normalize Mongo documents so the rest of the logic can stay clean and predictable.
  const kitchen = normalizeKitchen(kitchenDoc);
  const menus = menuDocs.map(normalizeMenu);
  const menuImages = menuImageDocs.map(normalizeMenuImage);
  const menuTags = menuTagDocs.map(normalizeMenuTag);
  const menuTagMap = menuTagMapDocs.map(normalizeMenuTagMap);

  const kitchenMenus = buildKitchenMenus({
    kitchen,
    menus,
    menuImages,
    menuTags,
    menuTagMap,
  });

  const menuItems = filterKitchenMenuItems(kitchenMenus, selectedCategory);
  const visibleMenuItems = buildVisibleKitchenMenuItems(
    menuItems,
    selectedCategory
  );

  return {
    kitchen,
    categories: defaultKitchenCategories,
    selectedCategory,
    kitchenMenus,
    visibleMenuItems,
  };
}
