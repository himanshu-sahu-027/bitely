import {
  defaultKitchenFilters,
  getFilteredKitchensByFoodPage,
  getKitchenGridItemsPage,
  getKitchenPageData,
} from "../services/kitchenService/index.js";
import {
  Food,
  FoodCategory,
  PopularFood,
  Kitchen,
  Menu,
} from "../models/kitchenCatalog/index.js";
import { createHttpError } from "../utils/createHttpError.js";
import { parsePagination } from "../utils/pagination.js";
import { sendResponse } from "../utils/sendResponse.js";

// Normalize query values like "veg,nonveg" or ["veg", "nonveg"] into a clean array.
const parseArrayFilter = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      String(item)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    );
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Convert incoming request query params into the filter shape expected by kitchen services.
const parseKitchenFilters = (query = {}) => {
  const tags = parseArrayFilter(query.tags);

  // Support simple boolean shortcuts like ?veg=true and ?nonveg=true
  // so Postman testing is easy without sending the full tags array.
  if (String(query.veg).toLowerCase() === "true") {
    tags.push("veg");
  }

  if (String(query.nonveg).toLowerCase() === "true") {
    tags.push("nonveg");
  }

  const filters = {
    ...defaultKitchenFilters,
    sort: query.sort || defaultKitchenFilters.sort,
    categories: parseArrayFilter(query.categories),
    tags: [...new Set(tags)],
    rating:
      query.minRating !== undefined
        ? Number.parseFloat(query.minRating)
        : query.rating !== undefined
        ? Number.parseFloat(query.rating)
        : defaultKitchenFilters.rating,
  };

  if (filters.rating && Number.isNaN(filters.rating)) {
    throw createHttpError("Invalid rating", 400);
  }

  return filters;
};

// GET /api/kitchen
// Returns the kitchen grid data with derived metadata and optional filters.
export const getKitchens = async (req, res, next) => {
  try {
    const filters = parseKitchenFilters(req.query);
    const pagination = parsePagination(req.query);
    const paginated = await getKitchenGridItemsPage(filters, pagination);

    sendResponse(res, {
      message: "Kitchens fetched successfully",
      data: paginated.data,
      filters,
      pagination: paginated.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/kitchen/food/:foodId
// Returns kitchens that can serve the selected food, using the same filter logic as the frontend.
export const getKitchensByFood = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const filters = parseKitchenFilters(req.query);
    const pagination = parsePagination(req.query);
    const paginated = await getFilteredKitchensByFoodPage(
      foodId,
      filters,
      pagination
    );

    sendResponse(res, {
      message: "Kitchens by food fetched successfully",
      data: paginated.data,
      foodId,
      filters,
      pagination: paginated.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/kitchen/:kitchenId
// Returns the kitchen page payload, including kitchen info, menu items, and selected category state.
export const getKitchenById = async (req, res, next) => {
  try {
    const { kitchenId } = req.params;
    const selectedCategory =
      req.query.selectedCategory || req.query.category || undefined;

    const kitchenPage = await getKitchenPageData(kitchenId, selectedCategory);

    sendResponse(res, {
      message: "Kitchen details fetched successfully",
      data: kitchenPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getFoodCategories = async (req, res, next) => {
  try {
    const categories = await FoodCategory.find().sort({ name: 1 }).lean();

    sendResponse(res, {
      message: "Food categories fetched successfully",
      data: categories.map((category) => ({
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        icon: category.icon || "",
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getFoods = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.slug) {
      query.slug = req.query.slug;
    }

    const foods = await Food.find(query)
      .populate("category_id")
      .sort({ name: 1 })
      .lean();

    sendResponse(res, {
      message: "Foods fetched successfully",
      data: foods.map((food) => ({
        id: String(food._id),
        name: food.name,
        slug: food.slug,
        categoryId: String(food.category_id?._id || food.category_id),
        categorySlug: food.category_id?.slug || null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getPopularFoods = async (req, res, next) => {
  try {
    const popularFoods = await PopularFood.find()
      .populate("food_id")
      .sort({ order: 1 })
      .lean();

    sendResponse(res, {
      message: "Popular foods fetched successfully",
      data: popularFoods
        .filter((item) => item.food_id)
        .map((item) => ({
          id: String(item._id),
          order: item.order,
          image: item.imageUrl || "",
          food: {
            id: String(item.food_id._id),
            name: item.food_id.name,
            slug: item.food_id.slug,
            categoryId: String(item.food_id.category_id),
          },
        })),
    });
  } catch (err) {
    next(err);
  }
};

export const searchFoodsAndKitchens = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return sendResponse(res, {
        message: "Search results",
        data: {
          foods: [],
          kitchens: [],
        },
      });
    }

    // Kitchens search (for KitchenCard)
    const kitchens = await Kitchen.find({
      name: {
        $regex: query,
        $options: "i",
      },
    })
      .limit(10)
      .lean();

    const kitchensPayload = kitchens.map((k) => ({
      id: String(k._id),
      name: k.name,
      image: k.imageUrl || "",
      showMenuImg: k.imageUrl || "",
      rating: k.rating ?? 0,
      address: k.address || "",
      deliveryTime: k.delivery_time || k.deliveryTime || "",
      lastOrderTime: k.last_order_time || k.lastOrderTime || "",
    }));

    // Foods search should be powered by Menu items so we have:
    // price, rating, imageUrl + associated kitchen + food name
    // (Food model itself doesn't store these).
    const menuItems = await Menu.find({
      name: { $regex: query, $options: "i" },
    })
      .populate(
        "kitchen_id",
        "name rating delivery_time imageUrl address last_order_time"
      )
      .populate("food_id", "name slug")
      .limit(10)
      .lean();

    const foodsPayload = menuItems
      .filter((m) => m.kitchen_id && m.food_id)
      .map((m) => ({
        id: String(m.food_id._id),
        name: m.food_id.name,
        slug: m.food_id.slug,
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

    sendResponse(res, {
      message: "Search results fetched successfully",
      data: {
        foods: foodsPayload,
        kitchens: kitchensPayload,
      },
    });
  } catch (err) {
    next(err);
  }
};
