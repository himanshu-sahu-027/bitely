export const defaultKitchenFilters = {
  sort: "popularity",
  categories: [],
  rating: 0,
  tags: [],
};

export function buildKitchenFilterMetadata({
  kitchens,
  menus,
  foods,
  categories,
  menuTags,
  menuTagMap,
}) {
  const tagNameById = Object.fromEntries(
    menuTags.map((tag) => [tag.id, tag.name]),
  );
  const foodCategoryIdByFoodId = Object.fromEntries(
    foods.map((food) => [food.id, food.categoryId]),
  );
  const categorySlugById = Object.fromEntries(
    categories.map((category) => [category.id, category.slug]),
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
    const matchedMenuTags = [
      ...new Set(relatedMenus.flatMap((menu) => tagNamesByMenuId[menu.id] ?? [])),
    ];
    const menuCategorySlugs = [
      ...new Set(
        relatedMenus
          .map((menu) => categorySlugById[foodCategoryIdByFoodId[menu.foodId]])
          .filter(Boolean),
      ),
    ];
    const deliveryMinutes = Number.parseInt(kitchen.deliveryTime, 10);

    return {
      ...kitchen,
      matchedMenuTags,
      menuCategorySlugs,
      deliveryMinutes: Number.isNaN(deliveryMinutes) ? null : deliveryMinutes,
    };
  });
}

export function applyKitchenGridFilters(kitchens, filters = defaultKitchenFilters) {
  const safeFilters = {
    ...defaultKitchenFilters,
    ...filters,
  };

  return kitchens
    .filter((kitchen) => {
      if (safeFilters.rating > 0 && kitchen.rating < safeFilters.rating) {
        return false;
      }

      if (
        safeFilters.tags.length > 0 &&
        !safeFilters.tags.every((tag) => kitchen.matchedMenuTags?.includes(tag))
      ) {
        return false;
      }

      if (
        safeFilters.categories.length > 0 &&
        !safeFilters.categories.some((slug) => kitchen.menuCategorySlugs?.includes(slug))
      ) {
        return false;
      }

      return true;
    })
    .sort((firstKitchen, secondKitchen) => {
      if (safeFilters.sort === "rating") {
        return secondKitchen.rating - firstKitchen.rating;
      }

      return 0;
    });
}
