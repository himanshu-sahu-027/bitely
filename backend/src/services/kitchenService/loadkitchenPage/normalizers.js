// Convert Mongo kitchen documents into the same shape expected by the old frontend query logic.
export const normalizeKitchen = (kitchen) => ({
  id: String(kitchen._id),
  name: kitchen.name,
  rating: kitchen.rating,
  deliveryTime: kitchen.delivery_time,
  imageUrl: kitchen.imageUrl,
  address: kitchen.address,
  lastOrderTime: kitchen.last_order_time,
});

// Convert Mongo menu documents into frontend-compatible menu records.
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

// Convert Mongo menu image documents into a compact lookup-friendly shape.
export const normalizeMenuImage = (menuImage) => ({
  id: String(menuImage._id),
  menuId: String(menuImage.menu_id),
  imageUrl: menuImage.imageUrl,
});

// Convert Mongo tag documents into simple tag records.
export const normalizeMenuTag = (menuTag) => ({
  id: String(menuTag._id),
  name: menuTag.name,
});

// Convert Mongo menu-tag relations into a lookup-friendly shape.
export const normalizeMenuTagMap = (menuTagMap) => ({
  id: String(menuTagMap._id),
  menuId: String(menuTagMap.menu_id),
  tagId: String(menuTagMap.tag_id),
});
