// Resolve the selected food's category slug, matching the old frontend lookup flow.
export const getCurrentFoodCategorySlug = ({
  currentFood,
  foods,
  categories,
}) => {
  const currentFoodId = String(currentFood._id);
  const currentFoodRecord = foods.find((food) => food.id === currentFoodId);

  return categories.find(
    (category) => category.id === currentFoodRecord?.categoryId
  )?.slug;
};

// Attach the matched menu image preview to each kitchen the same way the frontend did.
export const attachMatchedMenuImage = (kitchensWithFilterMetadata, filteredMenus) =>
  kitchensWithFilterMetadata.map((kitchen) => {
    const matchedMenu = filteredMenus.find((menu) => menu.kitchenId === kitchen.id);

    return {
      ...kitchen,
      showMenuImg: matchedMenu?.imageUrl ?? null,
    };
  });
