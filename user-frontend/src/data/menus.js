const menuImage = "/src/assets/images/dummy_food_img.png";

const mkMenu = ({ id, kitchenId, foodId, categoryId, name, price, rating }) => ({
  id,
  kitchenId,
  foodId,
  categoryId,
  name,
  price,
  rating,
  image: menuImage,
});

const menus = [
  // kitchen_1 (kcat_1, kcat_2)
  mkMenu({ id: "menu_1", kitchenId: "kitchen_1", foodId: "food_1", categoryId: "kcat_1", name: "Chicken Biryani", price: 279, rating: 4.5 }),
  mkMenu({ id: "menu_2", kitchenId: "kitchen_1", foodId: "food_2", categoryId: "kcat_1", name: "Veg Biryani", price: 249, rating: 4.3 }),
  mkMenu({ id: "menu_3", kitchenId: "kitchen_1", foodId: "food_4", categoryId: "kcat_2", name: "Paneer Butter Masala", price: 259, rating: 4.6 }),
  mkMenu({ id: "menu_4", kitchenId: "kitchen_1", foodId: "food_5", categoryId: "kcat_2", name: "Dal Fry", price: 229, rating: 4.2 }),

  // kitchen_2 (kcat_3, kcat_4)
  mkMenu({ id: "menu_5", kitchenId: "kitchen_2", foodId: "food_3", categoryId: "kcat_3", name: "Hyderabadi Chicken Biryani", price: 319, rating: 4.6 }),
  mkMenu({ id: "menu_6", kitchenId: "kitchen_2", foodId: "food_2", categoryId: "kcat_3", name: "Veg Biryani", price: 259, rating: 4.3 }),
  mkMenu({ id: "menu_7", kitchenId: "kitchen_2", foodId: "food_8", categoryId: "kcat_4", name: "Idli Sambar", price: 189, rating: 4.4 }),
  mkMenu({ id: "menu_8", kitchenId: "kitchen_2", foodId: "food_7", categoryId: "kcat_4", name: "Masala Dosa", price: 199, rating: 4.2 }),

  // kitchen_3 (kcat_5, kcat_6)
  mkMenu({ id: "menu_9", kitchenId: "kitchen_3", foodId: "food_1", categoryId: "kcat_5", name: "Chicken Biryani", price: 289, rating: 4.5 }),
  mkMenu({ id: "menu_10", kitchenId: "kitchen_3", foodId: "food_3", categoryId: "kcat_5", name: "Hyderabadi Chicken Biryani", price: 339, rating: 4.7 }),
  mkMenu({ id: "menu_11", kitchenId: "kitchen_3", foodId: "food_6", categoryId: "kcat_6", name: "Butter Chicken", price: 299, rating: 4.6 }),
  mkMenu({ id: "menu_12", kitchenId: "kitchen_3", foodId: "food_5", categoryId: "kcat_6", name: "Dal Fry", price: 239, rating: 4.3 }),

  // kitchen_4 (kcat_7, kcat_8)
  mkMenu({ id: "menu_13", kitchenId: "kitchen_4", foodId: "food_9", categoryId: "kcat_7", name: "Fish Fry", price: 349, rating: 4.4 }),
  mkMenu({ id: "menu_14", kitchenId: "kitchen_4", foodId: "food_10", categoryId: "kcat_7", name: "Chicken Fried Rice", price: 269, rating: 4.2 }),
  mkMenu({ id: "menu_15", kitchenId: "kitchen_4", foodId: "food_4", categoryId: "kcat_8", name: "Paneer Butter Masala", price: 269, rating: 4.6 }),
  mkMenu({ id: "menu_16", kitchenId: "kitchen_4", foodId: "food_5", categoryId: "kcat_8", name: "Dal Fry", price: 239, rating: 4.1 }),

  // kitchen_5 (kcat_9, kcat_10)
  mkMenu({ id: "menu_17", kitchenId: "kitchen_5", foodId: "food_2", categoryId: "kcat_9", name: "Veg Biryani", price: 259, rating: 4.3 }),
  mkMenu({ id: "menu_18", kitchenId: "kitchen_5", foodId: "food_1", categoryId: "kcat_9", name: "Chicken Biryani", price: 279, rating: 4.5 }),
  mkMenu({ id: "menu_19", kitchenId: "kitchen_5", foodId: "food_7", categoryId: "kcat_10", name: "Masala Dosa", price: 209, rating: 4.3 }),
  mkMenu({ id: "menu_20", kitchenId: "kitchen_5", foodId: "food_8", categoryId: "kcat_10", name: "Idli Sambar", price: 189, rating: 4.2 }),

  // kitchen_6 (kcat_11, kcat_12)
  mkMenu({ id: "menu_21", kitchenId: "kitchen_6", foodId: "food_3", categoryId: "kcat_11", name: "Hyderabadi Chicken Biryani", price: 329, rating: 4.6 }),
  mkMenu({ id: "menu_22", kitchenId: "kitchen_6", foodId: "food_2", categoryId: "kcat_11", name: "Veg Biryani", price: 249, rating: 4.1 }),
  mkMenu({ id: "menu_23", kitchenId: "kitchen_6", foodId: "food_6", categoryId: "kcat_12", name: "Butter Chicken", price: 309, rating: 4.7 }),
  mkMenu({ id: "menu_24", kitchenId: "kitchen_6", foodId: "food_5", categoryId: "kcat_12", name: "Dal Fry", price: 239, rating: 4.2 }),

  // kitchen_7 (kcat_13, kcat_14)
  mkMenu({ id: "menu_25", kitchenId: "kitchen_7", foodId: "food_1", categoryId: "kcat_13", name: "Chicken Biryani", price: 289, rating: 4.5 }),
  mkMenu({ id: "menu_26", kitchenId: "kitchen_7", foodId: "food_2", categoryId: "kcat_13", name: "Veg Biryani", price: 259, rating: 4.2 }),
  mkMenu({ id: "menu_27", kitchenId: "kitchen_7", foodId: "food_9", categoryId: "kcat_14", name: "Fish Fry", price: 359, rating: 4.5 }),
  mkMenu({ id: "menu_28", kitchenId: "kitchen_7", foodId: "food_10", categoryId: "kcat_14", name: "Chicken Fried Rice", price: 279, rating: 4.3 }),

  // kitchen_8 (kcat_15, kcat_16)
  mkMenu({ id: "menu_29", kitchenId: "kitchen_8", foodId: "food_3", categoryId: "kcat_15", name: "Hyderabadi Chicken Biryani", price: 339, rating: 4.7 }),
  mkMenu({ id: "menu_30", kitchenId: "kitchen_8", foodId: "food_1", categoryId: "kcat_15", name: "Chicken Biryani", price: 299, rating: 4.4 }),
  mkMenu({ id: "menu_31", kitchenId: "kitchen_8", foodId: "food_7", categoryId: "kcat_16", name: "Masala Dosa", price: 219, rating: 4.3 }),
  mkMenu({ id: "menu_32", kitchenId: "kitchen_8", foodId: "food_8", categoryId: "kcat_16", name: "Idli Sambar", price: 199, rating: 4.2 }),

  // kitchen_9 (kcat_17, kcat_18)
  mkMenu({ id: "menu_33", kitchenId: "kitchen_9", foodId: "food_2", categoryId: "kcat_17", name: "Veg Biryani", price: 269, rating: 4.3 }),
  mkMenu({ id: "menu_34", kitchenId: "kitchen_9", foodId: "food_3", categoryId: "kcat_17", name: "Hyderabadi Chicken Biryani", price: 349, rating: 4.6 }),
  mkMenu({ id: "menu_35", kitchenId: "kitchen_9", foodId: "food_6", categoryId: "kcat_18", name: "Butter Chicken", price: 319, rating: 4.7 }),
  mkMenu({ id: "menu_36", kitchenId: "kitchen_9", foodId: "food_4", categoryId: "kcat_18", name: "Paneer Butter Masala", price: 279, rating: 4.4 }),

  // kitchen_10 (kcat_19, kcat_20)
  mkMenu({ id: "menu_37", kitchenId: "kitchen_10", foodId: "food_1", categoryId: "kcat_19", name: "Chicken Biryani", price: 299, rating: 4.5 }),
  mkMenu({ id: "menu_38", kitchenId: "kitchen_10", foodId: "food_2", categoryId: "kcat_19", name: "Veg Biryani", price: 269, rating: 4.2 }),
  mkMenu({ id: "menu_39", kitchenId: "kitchen_10", foodId: "food_5", categoryId: "kcat_20", name: "Dal Fry", price: 249, rating: 4.1 }),
  mkMenu({ id: "menu_40", kitchenId: "kitchen_10", foodId: "food_7", categoryId: "kcat_20", name: "Masala Dosa", price: 229, rating: 4.3 }),
];

export default menus;
