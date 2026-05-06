// Convert Mongo food category documents into the same shape used by the old frontend logic.
export const normalizeCategory = (category) => ({
  id: String(category._id),
  name: category.name,
  slug: category.slug,
  icon: category.icon,
});

// Convert Mongo food documents into the frontend-compatible query shape.
export const normalizeFood = (food) => ({
  id: String(food._id),
  name: food.name,
  slug: food.slug,
  categoryId: String(food.category_id),
});

// Convert Mongo kitchen documents into the frontend-compatible query shape.
export const normalizeKitchen = (kitchen) => ({
  id: String(kitchen._id),
  name: kitchen.name,
  rating: kitchen.rating,
  deliveryTime: kitchen.delivery_time,
  imageUrl: kitchen.imageUrl,
  address: kitchen.address,
  lastOrderTime: kitchen.last_order_time,
});

// Convert Mongo menu documents into the frontend-compatible query shape.
export const normalizeMenu = (menu) => ({
  id: String(menu._id),
  kitchenId: String(menu.kitchen_id),
  foodId: String(menu.food_id),
  categoryId: String(menu.category_id),
  name: menu.name,
  price: menu.price,
  rating: menu.rating,
  imageUrl: menu.imageUrl,
});

// Convert Mongo tag documents into simple frontend-style records.
export const normalizeMenuTag = (menuTag) => ({
  id: String(menuTag._id),
  name: menuTag.name,
});

// Convert Mongo menu-tag relations into frontend-style records.
export const normalizeMenuTagMap = (menuTagMap) => ({
  id: String(menuTagMap._id),
  menuId: String(menuTagMap.menu_id),
  tagId: String(menuTagMap.tag_id),
});
