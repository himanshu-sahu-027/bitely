// These are the same category tabs used on the frontend kitchen page.
export const defaultKitchenCategories = ["Recommended", "Pure Veg", "Non Veg"];

// Keep the service return shape consistent for invalid ids and missing kitchens.
export const createEmptyKitchenPageResponse = (selectedCategory) => ({
  kitchen: null,
  categories: defaultKitchenCategories,
  selectedCategory,
  kitchenMenus: [],
  visibleMenuItems: [],
});
