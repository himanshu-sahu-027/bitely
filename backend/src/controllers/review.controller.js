import KitchenReview from "../models/reviewCatalog/kitchenReview.model.js";
import FoodReview from "../models/reviewCatalog/foodReview.model.js";
import Kitchen from "../models/kitchenCatalog/kitchen.model.js";
import Menu from "../models/kitchenCatalog/menu.model.js";
import Order from "../models/orderCatalog/order.model.js";

import { sendResponse } from "../utils/sendResponse.js";
import { createHttpError } from "../utils/createHttpError.js";

const updateKitchenRating = async (kitchenId) => {
  const stats = await KitchenReview.aggregate([
    { $match: { kitchen_id: kitchenId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length ? stats[0].averageRating : 0;
  const totalRatings = stats.length ? stats[0].totalRatings : 0;

  await Kitchen.findByIdAndUpdate(kitchenId, {
    rating: averageRating,
    totalRatings,
  });
};

const updateFoodRating = async (menuId) => {
  const stats = await FoodReview.aggregate([
    { $match: { menu_id: menuId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length ? stats[0].averageRating : 0;
  const totalRatings = stats.length ? stats[0].totalRatings : 0;

  await Menu.findByIdAndUpdate(menuId, {
    rating: averageRating,
    totalRatings,
  });
};

// add kitchen review
export const addKitchenReview = async (req, res, next) => {
  try {
    const { kitchenId } = req.params;
    const { orderId, rating, review } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user_id: req.user._id,
      kitchen_id: kitchenId,
      status: "delivered",
    });

    if (!order) {
      throw createHttpError("Only delivered orders can be reviewed", 403);
    }

    const existingReview = await KitchenReview.findOne({
      order_id: orderId,
      kitchen_id: kitchenId,
    });

    if (existingReview) {
      throw createHttpError("You already reviewed this kitchen", 400);
    }

    await KitchenReview.create({
      kitchen_id: kitchenId,
      user_id: req.user._id,
      order_id: orderId,
      rating,
      review,
    });


    await updateKitchenRating(kitchenId);

    return sendResponse(res, {
      message: "Kitchen review added successfully",
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

    const order = await Order.findOne({
      _id: orderId,
      user_id: req.user._id,
      status: "delivered",
    });

    if (!order) {
      throw createHttpError("Only delivered orders can be reviewed", 403);
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw createHttpError("Food item not found", 404);
    }

    const orderedFood = order.items.find(
      (item) => String(item.menuId) === menuId
    );

    if (!orderedFood) {
      throw createHttpError(
        "You can only review ordered food",
        403
      );
    }

    const exists = await FoodReview.findOne({
      order_id: orderId,
      menu_id: menuId,
    });

    if (exists) {
      throw createHttpError("Already reviewed", 400);
    }

    await FoodReview.create({
      menu_id: menuId,
      kitchen_id: menu.kitchen_id,
      user_id: req.user._id,
      order_id: orderId,
      rating,
      review,
    });

    await updateFoodRating(menuId);

    return sendResponse(res, {
      message: "Food review added successfully",
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

