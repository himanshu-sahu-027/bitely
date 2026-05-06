import { createHttpError } from "./createHttpError.js";

const MAX_LIMIT = 50;

export const parsePagination = (query = {}, defaultLimit = 10) => {
  const page = query.page !== undefined ? parseInt(query.page, 10) : 1;
  const limit =
    query.limit !== undefined
      ? parseInt(query.limit, 10)
      : defaultLimit;

  if (!Number.isInteger(page) || page < 1) {
    throw createHttpError("Invalid page", 400);
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw createHttpError("Invalid limit", 400);
  }

  if (limit > MAX_LIMIT) {
    throw createHttpError("Limit too large", 400);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
  };
};

export const paginateArray = (items, { page, limit, skip }) => ({
  data: items.slice(skip, skip + limit),
  pagination: buildPaginationMeta({
    page,
    limit,
    total: items.length,
  }),
});
