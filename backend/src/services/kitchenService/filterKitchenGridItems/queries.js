import {
  FoodCategory,
  Food,
  Kitchen,
  Menu,
  MenuTag,
  MenuTagMap,
} from "../../../models/kitchenCatalog/index.js";

// Load the same source collections that the frontend previously joined in memory.
export const loadKitchenGridSourceData = async () => {
  const [kitchens, menus, foods, categories, menuTags, menuTagMap] =
    await Promise.all([
      Kitchen.find().lean(),
      Menu.find().lean(),
      Food.find().lean(),
      FoodCategory.find().lean(),
      MenuTag.find().lean(),
      MenuTagMap.find().lean(),
    ]);

  return {
    kitchens,
    menus,
    foods,
    categories,
    menuTags,
    menuTagMap,
  };
};
