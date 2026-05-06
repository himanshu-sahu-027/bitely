// Recreate the frontend menu shaping logic:
// 1. keep only menus for the kitchen
// 2. attach menu image overrides
// 3. resolve tag ids into tag names
// 4. attach the parent kitchen object to each menu item
export const buildKitchenMenus = ({
  kitchen,
  menus,
  menuImages,
  menuTags,
  menuTagMap,
}) =>
  menus
    .filter((menu) => menu.kitchenId === kitchen.id)
    .map((menu) => {
      const menuImage = menuImages.find((image) => image.menuId === menu.id);
      const tagIds = menuTagMap
        .filter((tagMap) => tagMap.menuId === menu.id)
        .map((tagMap) => tagMap.tagId);
      const tags = menuTags
        .filter((tag) => tagIds.includes(tag.id))
        .map((tag) => tag.name);

      return {
        ...menu,
        imageUrl: menuImage?.imageUrl ?? menu.imageUrl,
        tags,
        kitchen,
      };
    });

// Apply the same menu tab rules used by the frontend kitchen page.
export const filterKitchenMenuItems = (kitchenMenus, selectedCategory) =>
  kitchenMenus.filter((menu) => {
    if (selectedCategory === "Recommended") {
      return true;
    }

    if (selectedCategory === "Pure Veg") {
      return menu.tags.includes("veg");
    }

    if (selectedCategory === "Non Veg") {
      return menu.tags.includes("nonveg");
    }

    return true;
  });

// Frontend behavior: the Recommended tab shows the top-rated six items only.
export const buildVisibleKitchenMenuItems = (menuItems, selectedCategory) =>
  selectedCategory === "Recommended"
    ? [...menuItems]
        .sort((firstMenu, secondMenu) => secondMenu.rating - firstMenu.rating)
        .slice(0, 6)
    : menuItems;
