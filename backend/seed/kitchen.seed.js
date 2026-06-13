import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import connectDB from "../src/config/db.js";
import User from "../src/models/user/user.model.js";
import {
  FoodCategory,
  Food,
  PopularFood,
  Kitchen,
  KitchenFoodCategory,
  Menu,
  MenuTag,
  MenuTagMap,
  MenuImage,
} from "../src/models/kitchenCatalog/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDataDir = path.resolve(__dirname, "../../user-frontend/src/data");

const loadFrontendData = async (fileName) => {
  const filePath = path.join(frontendDataDir, fileName);
  const source = await fs.readFile(filePath, "utf8");

  const transformed = source
    .replace(
      /^import\s+(\w+)\s+from\s+["']([^"']+)["'];?\s*$/gm,
      (_, variableName, importPath) =>
        `const ${variableName} = "${importPath}";`
    )
    .replace(/export default\s+(\w+);?\s*$/m, "return $1;");

  const executor = new Function(transformed);
  return executor();
};

const createIdMap = (items) =>
  Object.fromEntries(items.map(({ id }) => [id, new mongoose.Types.ObjectId()]));

const clearKitchenCatalogData = async () => {
  // Delete child collections first to avoid dependency issues.
  await MenuTagMap.deleteMany({});
  await MenuImage.deleteMany({});
  await PopularFood.deleteMany({});
  await Menu.deleteMany({});
  await KitchenFoodCategory.deleteMany({});

  // Delete parent collections after dependents are gone.
  await MenuTag.deleteMany({});
  await Food.deleteMany({});
  await FoodCategory.deleteMany({});
  await Kitchen.deleteMany({});
};

const ensureSeedVendors = async (vendorIds) => {
  const vendorIdMap = {};

  for (const vendorId of vendorIds) {
    const seedEmail = `${vendorId}@bitely.vendor.local`;

    const user = await User.findOneAndUpdate(
      { email: seedEmail },
      {
        $set: {
          name: `Seed Vendor ${vendorId.split("_").pop()}`,
          email: seedEmail,
          role: "vendor",
          authProvider: "email",
          isVerified: true,
          is_active: true,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    vendorIdMap[vendorId] = user._id;
  }

  return vendorIdMap;
};

const seedKitchenCatalog = async () => {
  const [
    categoriesData,
    foodsData,
    popularFoodsData,
    kitchensData,
    kitchenFoodCategoriesData,
    menusData,
    menuTagsData,
    menuTagMapData,
    menuImagesData,
  ] = await Promise.all([
    loadFrontendData("categories.js"),
    loadFrontendData("foods.js"),
    loadFrontendData("popularFoods.js"),
    loadFrontendData("kitchens.js"),
    loadFrontendData("kitchenFoodCategories.js"),
    loadFrontendData("menus.js"),
    loadFrontendData("menuTags.js"),
    loadFrontendData("menuTagMap.js"),
    loadFrontendData("menuImages.js"),
  ]);

  const categoryIds = createIdMap(categoriesData);
  const foodIds = createIdMap(foodsData);
  const popularFoodIds = createIdMap(popularFoodsData);
  const kitchenIds = createIdMap(kitchensData);
  const kitchenFoodCategoryIds = createIdMap(kitchenFoodCategoriesData);
  const menuIds = createIdMap(menusData);
  const menuTagIds = createIdMap(menuTagsData);
  const menuTagMapIds = createIdMap(menuTagMapData);
  const menuImageIds = createIdMap(menuImagesData);

  await connectDB();
  const vendorIds = [
    ...new Set(
      kitchensData
        .map((kitchen) => kitchen.owner_user_id)
        .filter(Boolean)
    ),
  ];
  const vendorIdMap = await ensureSeedVendors(vendorIds);

  const categories = categoriesData.map(({ id, name, slug, icon }) => ({
    _id: categoryIds[id],
    name,
    slug,
    icon,
  }));

  const foods = foodsData.map(({ id, name, slug, categoryId }) => ({
    _id: foodIds[id],
    name,
    slug,
    category_id: categoryIds[categoryId],
  }));

  const popularFoods = popularFoodsData.map(({ id, foodId, image, order }) => ({
    _id: popularFoodIds[id],
    food_id: foodIds[foodId],
    imageUrl: image,
    order,
  }));

  const kitchens = kitchensData.map(
    ({
      id,
      owner_user_id,
      name,
      rating,
      deliveryTime,
      image,
      address,
      lastOrderTime,
    }) => ({
      _id: kitchenIds[id],
      owner_user_id: owner_user_id ? vendorIdMap[owner_user_id] : null,
      name,
      rating,
      delivery_time: deliveryTime,
      imageUrl: image,
      address,
      last_order_time: lastOrderTime,
    })
  );

  const kitchenFoodCategories = kitchenFoodCategoriesData.map(
    ({ id, kitchenId, name, order }) => ({
      _id: kitchenFoodCategoryIds[id],
      kitchen_id: kitchenIds[kitchenId],
      name,
      order,
    })
  );

  const menus = menusData.map(
    ({ id, kitchenId, foodId, categoryId, name, price, rating, image }) => ({
      _id: menuIds[id],
      kitchen_id: kitchenIds[kitchenId],
      food_id: foodIds[foodId],
      category_id: kitchenFoodCategoryIds[categoryId],
      name,
      price,
      rating,
      imageUrl: image,
    })
  );

  const menuTags = menuTagsData.map(({ id, name }) => ({
    _id: menuTagIds[id],
    name,
  }));

  const menuTagMaps = menuTagMapData.map(({ id, menuId, tagId }) => ({
    _id: menuTagMapIds[id],
    menu_id: menuIds[menuId],
    tag_id: menuTagIds[tagId],
  }));

  const menuImages = menuImagesData.map(({ id, menuId, image }) => ({
    _id: menuImageIds[id],
    menu_id: menuIds[menuId],
    imageUrl: image,
  }));

  await clearKitchenCatalogData();

  try {
    await FoodCategory.insertMany(categories);
    await Food.insertMany(foods);
    await PopularFood.insertMany(popularFoods);
    await Kitchen.insertMany(kitchens);
    await KitchenFoodCategory.insertMany(kitchenFoodCategories);
    await Menu.insertMany(menus);
    await MenuTag.insertMany(menuTags);
    await MenuTagMap.insertMany(menuTagMaps);
    await MenuImage.insertMany(menuImages);
  } catch (error) {
    console.error("Insert failed", error);
    throw error;
  }

  console.log("Kitchen catalog seed completed");
  console.log(
    JSON.stringify(
      {
        categories: categories.length,
        foods: foods.length,
        popularFoods: popularFoods.length,
        kitchens: kitchens.length,
        kitchenFoodCategories: kitchenFoodCategories.length,
        menus: menus.length,
        menuTags: menuTags.length,
        menuTagMaps: menuTagMaps.length,
        menuImages: menuImages.length,
      },
      null,
      2
    )
  );
};

seedKitchenCatalog()
  .catch((error) => {
    console.error("Kitchen catalog seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
