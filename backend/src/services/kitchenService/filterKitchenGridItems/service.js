import { defaultKitchenFilters } from "./constants.js";
import {
  normalizeCategory,
  normalizeFood,
  normalizeKitchen,
  normalizeMenu,
  normalizeMenuTag,
  normalizeMenuTagMap,
} from "./normalizers.js";
import {
  applyKitchenGridFilters,
  buildKitchenFilterMetadata,
} from "./builders.js";
import { loadKitchenGridSourceData } from "./queries.js";
import { paginateArray } from "../../../utils/pagination.js";

export { defaultKitchenFilters } from "./constants.js";
export { buildKitchenFilterMetadata, applyKitchenGridFilters } from "./builders.js";

// Main kitchen grid query service.
// This keeps the entrypoint small and delegates the data loading,
// normalization, metadata building, and filtering to helper modules.
export async function getKitchenGridItems(filters = defaultKitchenFilters) {
  const { kitchens, menus, foods, categories, menuTags, menuTagMap } =
    await loadKitchenGridSourceData();

  const kitchensWithFilterMetadata = buildKitchenFilterMetadata({
    kitchens: kitchens.map(normalizeKitchen),
    menus: menus.map(normalizeMenu),
    foods: foods.map(normalizeFood),
    categories: categories.map(normalizeCategory),
    menuTags: menuTags.map(normalizeMenuTag),
    menuTagMap: menuTagMap.map(normalizeMenuTagMap),
  });

  return applyKitchenGridFilters(kitchensWithFilterMetadata, filters);
}

export async function getKitchenGridItemsPage(
  filters = defaultKitchenFilters,
  pagination
) {
  const kitchens = await getKitchenGridItems(filters);
  return paginateArray(kitchens, pagination);
}
