import {
  defaultKitchenFilters,
  getFilteredKitchensByFoodPage,
  getKitchenGridItemsPage,
  getKitchenPageData,
} from "../services/kitchenService/index.js";
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
