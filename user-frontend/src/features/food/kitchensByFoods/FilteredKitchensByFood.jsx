import categories from "../../../data/categories";
import foods from "../../../data/foods";
import kitchens from "../../../data/kitchens";
import menu from "../../../data/menus.js";
import menuTagMap from "../../../data/menuTagMap";
import menuTags from "../../../data/menuTags";
import {
  applyKitchenGridFilters,
  buildKitchenFilterMetadata,
  defaultKitchenFilters,
} from "../../../utils/filterKitchenGridItems";

export default function FilteredKitchensByFood({ foodId, filters = {} }) {
  if (!foodId) return [];

  const safeFilters = {
    ...defaultKitchenFilters,
    ...filters,
  };

  // find menus that contain the selected food
  const filteredMenus = menu.filter((menu) => menu.foodId === foodId);
  const currentFood = foods.find((food) => food.id === foodId);
  const currentCategorySlug = categories.find(
    (category) => category.id === currentFood?.categoryId,
  )?.slug;

  if (
    safeFilters.categories.length > 0 &&
    currentCategorySlug &&
    !safeFilters.categories.includes(currentCategorySlug)
  ) {
    return [];
  }

  // extract unique kitchen ids
  const kitchenIds = [...new Set(filteredMenus.map((menu) => menu.kitchenId))];

  const matchedKitchens = kitchens.filter((kitchen) =>
    kitchenIds.includes(kitchen.id),
  );
  const kitchensWithFilterMetadata = buildKitchenFilterMetadata({
    kitchens: matchedKitchens,
    menus: filteredMenus,
    foods,
    categories,
    menuTags,
    menuTagMap,
  }).map((kitchen) => {
    const matchedMenu = filteredMenus.find((menu) => menu.kitchenId === kitchen.id);

    return {
      ...kitchen,
      showMenuImg: matchedMenu?.image ?? null,
    };
  });

  const visibleKitchens = applyKitchenGridFilters(
    kitchensWithFilterMetadata,
    safeFilters,
  );

  return visibleKitchens;
}
