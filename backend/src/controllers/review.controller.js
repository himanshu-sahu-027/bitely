import mongoose from "mongoose";

import KitchenReview from "../models/reviewCatalog/kitchenReview.model.js";
import FoodReview from "../models/reviewCatalog/foodReview.model.js";
import Kitchen from "../models/kitchenCatalog/kitchen.model.js";
import Menu from "../models/kitchenCatalog/menu.model.js";
import Order from "../models/orderCatalog/order.model.js";
import OrderItem from "../models/orderCatalog/orderItem.model.js";

import { sendResponse } from "../utils/sendResponse.js";
import { createHttpError } from "../utils/createHttpError.js";

const ensureObjectId = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    throw createHttpError(`${fieldName} is required`, 400);
  }
};

const validateReviewPayload = ({ orderId, rating }) => {
  ensureObjectId(orderId, "orderId");

  const parsedRating = Number(rating);
  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw createHttpError("Rating must be between 1 and 5", 400);
  }

  return parsedRating;
};

const findDeliveredOrderForReview = ({ orderId, userId, kitchenId = null }) => {
  const query = {
    _id: orderId,
    userId,
    $or: [{ status: "delivered" }, { orderStatus: "delivered" }],
  };

  if (kitchenId) {
    query.kitchenId = kitchenId;
  }

  return Order.findOne(query);
};

const updateKitchenRating = async (kitchenId) => {
  const stats = await KitchenReview.aggregate([
    {
      $match: {
        kitchen_id: new mongoose.Types.ObjectId(kitchenId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        totalRatings: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating = stats.length ? stats[0].averageRating : 0;
  const totalRatings = stats.length ? stats[0].totalRatings : 0;

  await Kitchen.findByIdAndUpdate(
    kitchenId,
    {
      rating: averageRating,
      totalRatings,
    },
    {
      returnDocument: "after",
    },
  );
};

const updateFoodRating = async (menuId) => {
  const stats = await FoodReview.aggregate([
    {
      $match: {
        menu_id: new mongoose.Types.ObjectId(menuId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        totalRatings: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating = stats.length ? stats[0].averageRating : 0;
  const totalRatings = stats.length ? stats[0].totalRatings : 0;

  await Menu.findByIdAndUpdate(
    menuId,
    {
      rating: averageRating,
      totalRatings,
    },
    {
      returnDocument: "after",
    },
  );
};

// add kitchen review
export const addKitchenReview = async (req, res, next) => {
  try {
    const { kitchenId } = req.params;
    const { orderId, rating, review } = req.body;
    const parsedRating = validateReviewPayload({ orderId, rating });

    ensureObjectId(kitchenId, "kitchenId");

    const order = await findDeliveredOrderForReview({
      orderId,
      userId: req.user._id,
      kitchenId,
    });

    if (!order) {
      throw createHttpError("Only delivered orders can be reviewed", 403);
    }

    const existingReview = await KitchenReview.findOne({
      order_id: orderId,
      kitchen_id: kitchenId,
      user_id: req.user._id,
    });

    if (existingReview) {
      throw createHttpError(
        "You already reviewed this kitchen for this order",
        400,
      );
    }

    const createdReview = await KitchenReview.create({
      kitchen_id: kitchenId,
      user_id: req.user._id,
      order_id: orderId,
      rating: parsedRating,
      review,
    });

    await updateKitchenRating(kitchenId);

    return sendResponse(res, {
      message: "Kitchen review added successfully",
      data: createdReview,
    });
  } catch (err) {
    next(err);
  }
};

// get kitchen reviews
export const getKitchenReviews = async (req, res, next) => {
  try {
    const reviews = await KitchenReview.find({
      kitchen_id: req.params.kitchenId,
    })
      .populate("user_id", "name avatar")
      .sort({
        createdAt: -1,
      });

    return sendResponse(res, {
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// add food review
export const addFoodReview = async (req, res, next) => {
  try {
    const { menuId } = req.params;

    const { orderId, rating, review } = req.body;
    const parsedRating = validateReviewPayload({ orderId, rating });
    ensureObjectId(menuId, "menuId");

    const order = await findDeliveredOrderForReview({
      orderId,
      userId: req.user._id,
    });

    if (!order) {
      throw createHttpError("Only delivered orders can be reviewed", 403);
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw createHttpError("Food item not found", 404);
    }

    const orderedFood = await OrderItem.findOne({
      orderId: orderId,
      menuId: menuId,
    }).lean();

    if (!orderedFood) {
      throw createHttpError("You can only review ordered food", 403);
    }

    const exists = await FoodReview.findOne({
      order_id: orderId,
      menu_id: menuId,
      user_id: req.user._id,
    });

    if (exists) {
      throw createHttpError(
        "You already reviewed this food for this order",
        400,
      );
    }

    const createdReview = await FoodReview.create({
      menu_id: menuId,
      kitchen_id: menu.kitchen_id,
      user_id: req.user._id,
      order_id: orderId,
      rating: parsedRating,
      review,
    });

    await updateFoodRating(menuId);

    return sendResponse(res, {
      message: "Food review added successfully",
      data: createdReview,
    });
  } catch (err) {
    next(err);
  }
};

// get food reviews
export const getFoodReviews = async (req, res, next) => {
  try {
    const reviews = await FoodReview.find({
      menu_id: req.params.menuId,
    })
      .populate("user_id", "name avatar")
      .sort({ createdAt: -1 });

    return sendResponse(res, {
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const updateKitchenReview = async (req, res, next) => {
  try {
    const review = await KitchenReview.findOne({
      _id: req.params.reviewId,
      user_id: req.user._id,
    });

    if (!review) {
      throw createHttpError("Review not found", 404);
    }

    review.rating = req.body.rating ?? review.rating;
    review.review = req.body.review ?? review.review;

    await review.save();

    await updateKitchenRating(review.kitchen_id);

    return sendResponse(res, {
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteKitchenReview = async (req, res, next) => {
  try {
    const review = await KitchenReview.findOneAndDelete({
      _id: req.params.reviewId,
      user_id: req.user._id,
    });

    if (!review) {
      throw createHttpError("Review not found", 404);
    }

    await updateKitchenRating(review.kitchen_id);

    return sendResponse(res, {
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateFoodReview = async (req, res, next) => {
  try {
    const review = await FoodReview.findOne({
      _id: req.params.reviewId,
      user_id: req.user._id,
    });

    if (!review) {
      throw createHttpError("Review not found", 404);
    }

    review.rating = req.body.rating ?? review.rating;
    review.review = req.body.review ?? review.review;

    await review.save();

    await updateFoodRating(review.menu_id);

    return sendResponse(res, {
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFoodReview = async (req, res, next) => {
  try {
    const review = await FoodReview.findOneAndDelete({
      _id: req.params.reviewId,
      user_id: req.user._id,
    });

    if (!review) {
      throw createHttpError("Review not found", 404);
    }

    await updateFoodRating(review.menu_id);

    return sendResponse(res, {
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
