import { Kitchen, Menu } from "../models/kitchenCatalog/index.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildKitchensPayload = (kitchens) =>
  kitchens.map((k) => ({
    id: String(k._id),
    name: k.name,
    image: k.imageUrl || "",
    showMenuImg: k.imageUrl || "",
    rating: k.rating ?? 0,
    address: k.address || "",
    deliveryTime: k.delivery_time || k.deliveryTime || "",
    lastOrderTime: k.last_order_time || k.lastOrderTime || "",
  }));

const buildMenusPayload = (menuItems) => {
  const menusPayload = menuItems.map((m) => ({
    id: String(m._id), // Menu ID
    name: m.name, // Menu Name
    slug: m.slug, // Menu.slug
    image: m.imageUrl || "",
    price: m.price ?? 0,
    rating: m.rating ?? 0,
    kitchen: {
      id: String(m.kitchen_id._id),
      name: m.kitchen_id.name,
      deliveryTime:
        m.kitchen_id.delivery_time || m.kitchen_id.deliveryTime || "",
    },
  }));

  // Keep existing UX: unique suggestions by name (legacy behavior)
  return Array.from(
    new Map(
      menusPayload.map((menu) => [menu.name.trim().toLowerCase(), menu])
    ).values()
  );
};

const searchKitchensByMenuSlug = async (menuSlug) => {
  // Fetch menu details for page heading
  const menuDoc = await Menu.findOne(
    { slug: menuSlug },
    { name: 1, slug: 1, _id: 0 }
  ).lean();

  if (!menuDoc) {
    return {
      menu: null,
      kitchens: [],
    };
  }

  // Fetch all kitchens serving this menu
  const kitchensFromMenu = await Menu.aggregate([
    { $match: { slug: menuSlug } },
    {
      $lookup: {
        from: "kitchens",
        localField: "kitchen_id",
        foreignField: "_id",
        as: "kitchen",
      },
    },
    { $unwind: "$kitchen" },
    {
      $group: {
        _id: "$kitchen._id",
        doc: { $first: "$kitchen" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $limit: 50 },
  ]);

  return {
    menu: {
      name: menuDoc.name,
      slug: menuDoc.slug,
    },
    kitchens: buildKitchensPayload(kitchensFromMenu),
  };
};


const searchService = async (query) => {
  const escapedQuery = escapeRegex(query);

  // Kitchens search (unchanged behavior)
  const kitchens = await Kitchen.find({
    name: { $regex: escapedQuery, $options: "i" },
  })
    .limit(10)
    .lean();

  const kitchensPayload = buildKitchensPayload(kitchens);

  // Menu aggregation (search by Menu.name OR Food.name, legacy behavior)
  const menuNameRegex = { $regex: escapedQuery, $options: "i" };
  const foodNameRegex = { $regex: escapedQuery, $options: "i" };

  const menuItems = await Menu.aggregate([
    {
      $lookup: {
        from: "foods",
        localField: "food_id",
        foreignField: "_id",
        as: "food_id",
      },
    },
    { $unwind: "$food_id" },
    {
      $lookup: {
        from: "kitchens",
        localField: "kitchen_id",
        foreignField: "_id",
        as: "kitchen_id",
      },
    },
    { $unwind: "$kitchen_id" },
    {
      $match: {
        $or: [{ name: menuNameRegex }, { "food_id.name": foodNameRegex }],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1, // Menu.slug
        price: 1,
        rating: 1,
        imageUrl: 1,
        kitchen_id: {
          _id: "$kitchen_id._id",
          name: "$kitchen_id.name",
          rating: "$kitchen_id.rating",
          delivery_time: "$kitchen_id.delivery_time",
          imageUrl: "$kitchen_id.imageUrl",
          address: "$kitchen_id.address",
          last_order_time: "$kitchen_id.last_order_time",
        },
      },
    },
    { $limit: 10 },
  ]);

  const menus = buildMenusPayload(menuItems);

  return { menus, kitchens: kitchensPayload };
};

export { searchService, searchKitchensByMenuSlug };
