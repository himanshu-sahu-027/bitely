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

const frontendSeedFiles = [
  "categories.js",
  "foods.js",
  "popularFoods.js",
  "kitchens.js",
  "kitchenFoodCategories.js",
  "menus.js",
  "menuTags.js",
  "menuTagMap.js",
  "menuImages.js",
];

const hasFrontendSeedData = async () => {
  try {
    await Promise.all(
      frontendSeedFiles.map((fileName) =>
        fs.access(path.join(frontendDataDir, fileName))
      )
    );
    return true;
  } catch {
    return false;
  }
};

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

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cloneKitchenCatalogData = ({
  popularFoodsData,
  kitchensData,
  kitchenFoodCategoriesData,
  menusData,
  menuTagMapData,
  menuImagesData,
}) => {
  const kitchenIdMap = Object.fromEntries(
    kitchensData.map((kitchen, index) => [
      kitchen.id,
      `${kitchen.id}_clone_${index + 1}`,
    ])
  );
  const categoryIdMap = Object.fromEntries(
    kitchenFoodCategoriesData.map((category, index) => [
      category.id,
      `${category.id}_clone_${index + 1}`,
    ])
  );
  const menuIdMap = Object.fromEntries(
    menusData.map((menu, index) => [
      menu.id,
      `${menu.id}_clone_${index + 1}`,
    ])
  );

  const clonedPopularFoods = popularFoodsData.map((item, index) => ({
    ...item,
    id: `${item.id}_clone_${index + 1}`,
    order: Number(item.order ?? index + 1) + popularFoodsData.length,
  }));

  const clonedKitchens = kitchensData.map((kitchen, index) => ({
    ...kitchen,
    id: kitchenIdMap[kitchen.id],
    owner_user_id: kitchen.owner_user_id
      ? `${kitchen.owner_user_id}_clone`
      : null,
    name: `${kitchen.name} Express`,
    rating: Math.max(3.8, Number(kitchen.rating ?? 4.2) - 0.1),
    deliveryTime: `${Math.max(
      15,
      Number.parseInt(kitchen.deliveryTime, 10) + 5
    )} min`,
    address: `${kitchen.address}, Branch ${index + 2}`,
    lastOrderTime: kitchen.lastOrderTime || "11:00 PM",
  }));

  const clonedKitchenFoodCategories = kitchenFoodCategoriesData.map(
    (category, index) => ({
      ...category,
      id: categoryIdMap[category.id],
      kitchenId: kitchenIdMap[category.kitchenId],
      order: Number(category.order ?? index + 1),
    })
  );

  const clonedMenus = menusData.map((menu, index) => {
    const menuName = `${menu.name} Special`;
    return {
      ...menu,
      id: menuIdMap[menu.id],
      kitchenId: kitchenIdMap[menu.kitchenId],
      categoryId: categoryIdMap[menu.categoryId],
      name: menuName,
      slug: slugify(menuName),
      price: Number(menu.price) + 20,
      rating: Math.max(3.9, Number(menu.rating ?? 4.3) - 0.1),
    };
  });

  const clonedMenuTagMaps = menuTagMapData.map((tagMap, index) => ({
    ...tagMap,
    id: `${tagMap.id}_clone_${index + 1}`,
    menuId: menuIdMap[tagMap.menuId],
  }));

  const clonedMenuImages = menuImagesData.map((image, index) => ({
    ...image,
    id: `${image.id}_clone_${index + 1}`,
    menuId: menuIdMap[image.menuId],
  }));

  return {
    popularFoodsData: [...popularFoodsData, ...clonedPopularFoods],
    kitchensData: [...kitchensData, ...clonedKitchens],
    kitchenFoodCategoriesData: [
      ...kitchenFoodCategoriesData,
      ...clonedKitchenFoodCategories,
    ],
    menusData: [...menusData, ...clonedMenus],
    menuTagMapData: [...menuTagMapData, ...clonedMenuTagMaps],
    menuImagesData: [...menuImagesData, ...clonedMenuImages],
  };
};

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

const sanitizeDocument = (document) => {
  const { __v, ...rest } = document;
  return rest;
};

const duplicateDatabaseSeedDocuments = ({
  popularFoods,
  kitchens,
  kitchenFoodCategories,
  menus,
  menuTagMaps,
  menuImages,
}) => {
  const kitchenIdMap = Object.fromEntries(
    kitchens.map((kitchen) => [
      String(kitchen._id),
      new mongoose.Types.ObjectId(),
    ])
  );
  const kitchenCategoryIdMap = Object.fromEntries(
    kitchenFoodCategories.map((category) => [
      String(category._id),
      new mongoose.Types.ObjectId(),
    ])
  );
  const menuIdMap = Object.fromEntries(
    menus.map((menu) => [String(menu._id), new mongoose.Types.ObjectId()])
  );

  return {
    popularFoods: [
      ...popularFoods.map(sanitizeDocument),
      ...popularFoods.map((item, index) => ({
        ...sanitizeDocument(item),
        _id: new mongoose.Types.ObjectId(),
        order: Number(item.order ?? index + 1) + popularFoods.length,
      })),
    ],
    kitchens: [
      ...kitchens.map(sanitizeDocument),
      ...kitchens.map((kitchen, index) => ({
        ...sanitizeDocument(kitchen),
        _id: kitchenIdMap[String(kitchen._id)],
        name: `${kitchen.name} Express`,
        rating: Math.max(3.8, Number(kitchen.rating ?? 4.2) - 0.1),
        delivery_time: Math.max(
          15,
          Number.parseInt(kitchen.delivery_time ?? kitchen.deliveryTime, 10) + 5
        ),
        address: `${kitchen.address}, Branch ${index + 2}`,
        last_order_time: kitchen.last_order_time || "11:00 PM",
      })),
    ],
    kitchenFoodCategories: [
      ...kitchenFoodCategories.map(sanitizeDocument),
      ...kitchenFoodCategories.map((category) => ({
        ...sanitizeDocument(category),
        _id: kitchenCategoryIdMap[String(category._id)],
        kitchen_id: kitchenIdMap[String(category.kitchen_id)],
      })),
    ],
    menus: [
      ...menus.map(sanitizeDocument),
      ...menus.map((menu) => {
        const menuName = `${menu.name} Special`;
        return {
          ...sanitizeDocument(menu),
          _id: menuIdMap[String(menu._id)],
          kitchen_id: kitchenIdMap[String(menu.kitchen_id)],
          category_id: kitchenCategoryIdMap[String(menu.category_id)],
          name: menuName,
          slug: slugify(menuName),
          price: Number(menu.price) + 20,
          rating: Math.max(3.9, Number(menu.rating ?? 4.3) - 0.1),
        };
      }),
    ],
    menuTagMaps: [
      ...menuTagMaps.map(sanitizeDocument),
      ...menuTagMaps.map((tagMap) => ({
        ...sanitizeDocument(tagMap),
        _id: new mongoose.Types.ObjectId(),
        menu_id: menuIdMap[String(tagMap.menu_id)],
      })),
    ],
    menuImages: [
      ...menuImages.map(sanitizeDocument),
      ...menuImages.map((image) => ({
        ...sanitizeDocument(image),
        _id: new mongoose.Types.ObjectId(),
        menu_id: menuIdMap[String(image.menu_id)],
      })),
    ],
  };
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
  await connectDB();
  const canLoadFrontendSeedData = await hasFrontendSeedData();
  console.log("canLoadFrontendSeedData =", canLoadFrontendSeedData);


  if (!canLoadFrontendSeedData) {
    const [categories, foods, popularFoods, kitchens, kitchenFoodCategories, menus, menuTags, menuTagMaps, menuImages] =
      await Promise.all([
        FoodCategory.find().lean(),
        Food.find().lean(),
        PopularFood.find().lean(),
        Kitchen.find().lean(),
        KitchenFoodCategory.find().lean(),
        Menu.find().lean(),
        MenuTag.find().lean(),
        MenuTagMap.find().lean(),
        MenuImage.find().lean(),
      ]);

    const duplicated = duplicateDatabaseSeedDocuments({
      popularFoods,
      kitchens,
      kitchenFoodCategories,
      menus,
      menuTagMaps,
      menuImages,
    });

    await clearKitchenCatalogData();

    await FoodCategory.insertMany(categories.map(sanitizeDocument));
    await Food.insertMany(foods.map(sanitizeDocument));
    await PopularFood.insertMany(duplicated.popularFoods);
    await Kitchen.insertMany(duplicated.kitchens);
    await KitchenFoodCategory.insertMany(duplicated.kitchenFoodCategories);
    await Menu.insertMany(duplicated.menus);
    await MenuTag.insertMany(menuTags.map(sanitizeDocument));
    await MenuTagMap.insertMany(duplicated.menuTagMaps);
    await MenuImage.insertMany(duplicated.menuImages);

    console.log("Kitchen catalog seed completed from existing database data");
    console.log(
      JSON.stringify(
        {
          categories: categories.length,
          foods: foods.length,
          popularFoods: duplicated.popularFoods.length,
          kitchens: duplicated.kitchens.length,
          kitchenFoodCategories: duplicated.kitchenFoodCategories.length,
          menus: duplicated.menus.length,
          menuTags: menuTags.length,
          menuTagMaps: duplicated.menuTagMaps.length,
          menuImages: duplicated.menuImages.length,
        },
        null,
        2
      )
    );
    return;
  }

  const [
    categoriesData,
    foodsData,
    rawPopularFoodsData,
    rawKitchensData,
    rawKitchenFoodCategoriesData,
    rawMenusData,
    menuTagsData,
    rawMenuTagMapData,
    rawMenuImagesData,
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

  const {
    popularFoodsData,
    kitchensData,
    kitchenFoodCategoriesData,
    menusData,
    menuTagMapData,
    menuImagesData,
  } = cloneKitchenCatalogData({
    popularFoodsData: rawPopularFoodsData,
    kitchensData: rawKitchensData,
    kitchenFoodCategoriesData: rawKitchenFoodCategoriesData,
    menusData: rawMenusData,
    menuTagMapData: rawMenuTagMapData,
    menuImagesData: rawMenuImagesData,
  });

  const categoryIds = createIdMap(categoriesData);
  const foodIds = createIdMap(foodsData);
  const popularFoodIds = createIdMap(popularFoodsData);
  const kitchenIds = createIdMap(kitchensData);
  const kitchenFoodCategoryIds = createIdMap(kitchenFoodCategoriesData);
  const menuIds = createIdMap(menusData);
  const menuTagIds = createIdMap(menuTagsData);
  const menuTagMapIds = createIdMap(menuTagMapData);
  const menuImageIds = createIdMap(menuImagesData);

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
    ({ id, kitchenId, foodId, categoryId, name, price, rating, image }) => {
      const menuName = name;
      return {
        _id: menuIds[id],
        kitchen_id: kitchenIds[kitchenId],
        food_id: foodIds[foodId],
        category_id: kitchenFoodCategoryIds[categoryId],
        name: menuName,
        slug: slugify(menuName),
        price,
        rating,
        imageUrl: image,
      };
    }
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
