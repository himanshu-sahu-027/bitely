import { createHttpError } from "../utils/createHttpError.js";
import {
  searchService,
  searchKitchensByMenuSlug,
} from "../services/search.service.js";
import { sendResponse } from "../utils/sendResponse.js";

const parseQuery = (q) => {
  const query = typeof q === "string" ? q.trim() : "";
  if (!query) {
    throw createHttpError("Query parameter 'q' is required", 400);
  }
  return query;
};

const parseSlugParam = (slug) => {
  const value = typeof slug === "string" ? slug.trim() : "";
  if (!value) {
    throw createHttpError("Menu slug param is required", 400);
  }
  return value;
};

export const search = async (req, res, next) => {
  try {
    const q = parseQuery(req.query?.q);

    const data = await searchService(q);

    return sendResponse(res, {
      message: "Search results fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const searchMenuKitchens = async (req, res, next) => {
  try {
    const slug = parseSlugParam(req.params?.slug);

    const data = await searchKitchensByMenuSlug(slug);

    return sendResponse(res, {
      message: "Menu kitchens fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
