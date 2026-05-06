import { defaultKitchenFilters } from "./constants.js";

// Rebuild the metadata enrichment logic from the frontend utility.
// This computes menu tags, menu category slugs, delivery minutes,
// and a comparable kitchen price signal.
export function buildKitchenFilterMetadata({
  kitchens,
  menus,
  foods,
  categories,
  menuTags,
  menuTagMap,
}) {
  const tagNameById = Object.fromEntries(
    menuTags.map((tag) => [tag.id, tag.name])
  );
  const foodCategoryIdByFoodId = Object.fromEntries(
    foods.map((food) => [food.id, food.categoryId])
  );
  const categorySlugById = Object.fromEntries(
    categories.map((category) => [category.id, category.slug])
  );

  const tagNamesByMenuId = menuTagMap.reduce((acc, relation) => {
    if (!acc[relation.menuId]) {
      acc[relation.menuId] = [];
    }

    const tagName = tagNameById[relation.tagId];
    if (tagName) {
      acc[relation.menuId].push(tagName);
    }

    return acc;
  }, {});

  return kitchens.map((kitchen) => {
    const relatedMenus = menus.filter((menu) => menu.kitchenId === kitchen.id);
    const menuFilterRecords = relatedMenus.map((menu) => ({
      id: menu.id,
      price: menu.price,
      tags: [...new Set(tagNamesByMenuId[menu.id] ?? [])],
      categorySlug: categorySlugById[foodCategoryIdByFoodId[menu.foodId]] ?? null,
    }));
    const matchedMenuTags = [
      ...new Set(menuFilterRecords.flatMap((menu) => menu.tags)),
    ];
    const menuCategorySlugs = [
      ...new Set(menuFilterRecords.map((menu) => menu.categorySlug).filter(Boolean)),
    ];
    const deliveryMinutes = Number.parseInt(kitchen.deliveryTime, 10);

    return {
      ...kitchen,
      menuFilterRecords,
      matchedMenuTags,
      menuCategorySlugs,
      deliveryMinutes: Number.isNaN(deliveryMinutes) ? null : deliveryMinutes,
      minMenuPrice:
        menuFilterRecords.length > 0
          ? Math.min(...menuFilterRecords.map((menu) => menu.price))
          : null,
    };
  });
}

// Apply the exact kitchen grid filtering and sorting rules previously used on the frontend.
export function applyKitchenGridFilters(
  kitchens,
  filters = defaultKitchenFilters
) {
  const safeFilters = {
    ...defaultKitchenFilters,
    ...filters,
  };

  return kitchens
    .filter((kitchen) => {
      if (safeFilters.rating > 0 && kitchen.rating < safeFilters.rating) {
        return false;
      }

      // When category and tag filters are both selected, require a single menu item
      // to satisfy that combined filter instead of matching them across different items.
      if (safeFilters.tags.length > 0 || safeFilters.categories.length > 0) {
        const hasMatchingMenu = (kitchen.menuFilterRecords ?? []).some((menu) => {
          if (
            safeFilters.tags.length > 0 &&
            !safeFilters.tags.every((tag) => menu.tags.includes(tag))
          ) {
            return false;
          }

          if (
            safeFilters.categories.length > 0 &&
            !safeFilters.categories.includes(menu.categorySlug)
          ) {
            return false;
          }

          return true;
        });

        if (!hasMatchingMenu) {
          return false;
        }
      }

      return true;
    })
    .sort((firstKitchen, secondKitchen) => {
      if (safeFilters.sort === "rating") {
        return secondKitchen.rating - firstKitchen.rating;
      }

      if (safeFilters.sort === "priceLow") {
        return (firstKitchen.minMenuPrice ?? Number.POSITIVE_INFINITY) -
          (secondKitchen.minMenuPrice ?? Number.POSITIVE_INFINITY);
      }

      if (safeFilters.sort === "priceHigh") {
        return (secondKitchen.minMenuPrice ?? Number.NEGATIVE_INFINITY) -
          (firstKitchen.minMenuPrice ?? Number.NEGATIVE_INFINITY);
      }

      return 0;
    });
}
