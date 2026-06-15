import KitchenReview from "../models/reviewCatalog/kitchenReview.model.js";
import FoodReview from "../models/reviewCatalog/foodReview.model.js";
import Kitchen from "../models/kitchenCatalog/kitchen.model.js";
import Menu from "../models/kitchenCatalog/menu.model.js";
import Order from "../models/orderCatalog/order.model.js";

import { sendResponse } from "../utils/sendResponse.js";
import { createHttpError } from "../utils/createHttpError.js";

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
      kitchen_id: kitchenId,
      user_id: req.user._id,
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


    const reviews = await KitchenReview.find({
      kitchen_id: kitchenId,
    });

    const average =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await Kitchen.findByIdAndUpdate(kitchenId, {
      rating: average,
      totalRatings: reviews.length,
    });

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
      menu_id: menuId,
      user_id: req.user._id,
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

    const reviews = await FoodReview.find({
      menu_id: menuId,
    });

    const average =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await Menu.findByIdAndUpdate(menuId, {
      rating: average,
      totalRatings: reviews.length,
    });

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

    const reviews = await KitchenReview.find({
      kitchen_id: review.kitchen_id,
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Kitchen.findByIdAndUpdate(review.kitchen_id, {
      rating: average,
      totalRatings: reviews.length,
    });

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

    const reviews = await KitchenReview.find({
      kitchen_id: review.kitchen_id,
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Kitchen.findByIdAndUpdate(review.kitchen_id, {
      rating: average,
      totalRatings: reviews.length,
    });

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

    const reviews = await FoodReview.find({
      menu_id: review.menu_id,
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Menu.findByIdAndUpdate(review.menu_id, {
      rating: average,
      totalRatings: reviews.length,
    });

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

    const reviews = await FoodReview.find({
      menu_id: review.menu_id,
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Menu.findByIdAndUpdate(review.menu_id, {
      rating: average,
      totalRatings: reviews.length,
    });

    return sendResponse(res, {
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

