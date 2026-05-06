import {
  FoodCategory,
  Food,
  Menu,
  MenuTag,
  MenuTagMap,
} from "../../../models/kitchenCatalog/index.js";

// Load the selected food, its matching menus, and the lookup collections
// that the old frontend logic joined together in memory.
export const loadFilteredKitchensByFoodSourceData = async (foodId) => {
  const [
    currentFood,
    filteredMenuDocs,
    foodsDocs,
    categoryDocs,
    menuTagDocs,
    menuTagMapDocs,
  ] = await Promise.all([
    Food.findById(foodId).lean(),
    Menu.find({ food_id: foodId }).lean(),
    Food.find().lean(),
    FoodCategory.find().lean(),
    MenuTag.find().lean(),
    MenuTagMap.find().lean(),
  ]);

  return {
    currentFood,
    filteredMenuDocs,
    foodsDocs,
    categoryDocs,
    menuTagDocs,
    menuTagMapDocs,
  };
};
