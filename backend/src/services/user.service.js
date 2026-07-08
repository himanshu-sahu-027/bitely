import User from "../models/user/user.model.js";
import UserAddress from "../models/user/address.model.js";
import AuthSession from "../models/user/authSession.model.js";
import EmailVerificationOtp from "../models/user/emailVerificationOtp.model.js";
import PendingSignup from "../models/user/pendingSignup.model.js";
import UserLocation from "../models/user/location.model.js";
import FoodReview from "../models/reviewCatalog/foodReview.model.js";
import KitchenReview from "../models/reviewCatalog/kitchenReview.model.js";
import { Cart, CartItem, Order, OrderItem, OrderPricing, OrderStatusHistory, Payment } from "../models/orderCatalog/index.js";
import { createHttpError } from "../utils/createHttpError.js";

export const updateUserProfile = async ({ userId, name }) => {

  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  if (name) {
    user.name = name;
  }



  await user.save();

  return user;
};

export const createUserAddress = async ({ userId, addressData }) => {
  const existingAddressCount = await UserAddress.countDocuments({
    user_id: userId,
  });

  const shouldBeDefault =
    Boolean(addressData.is_default) || existingAddressCount === 0;

  if (shouldBeDefault) {
    await UserAddress.updateMany({ user_id: userId }, { is_default: false });
  }

  return UserAddress.create({
    user_id: userId,
    ...addressData,
    is_default: shouldBeDefault,
  });
};

export const listUserAddresses = async (userId) =>
  UserAddress.find({ user_id: userId }).sort({ is_default: -1 });

export const editUserAddress = async ({ userId, addressId, updateData }) => {
  const address = await UserAddress.findById(addressId);

  if (!address) {
    throw createHttpError("Address not found", 404);
  }

  if (address.user_id.toString() !== userId.toString()) {
    throw createHttpError("Forbidden", 403);
  }

  if (updateData.is_default) {

    await UserAddress.updateMany({ user_id: userId }, { is_default: false });
  }

  if (updateData.is_default === false && address.is_default) {
    const replacementDefault = await UserAddress.findOne({
      user_id: userId,
      _id: { $ne: address._id },
    }).sort({ createdAt: 1 });

    if (!replacementDefault) {
      delete updateData.is_default;
    } else {
      replacementDefault.is_default = true;
      await replacementDefault.save();
    }
  }

  // Whitelist editable fields only
  const editableFields = [
    "label",
    "address_line",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "is_default",
  ];

  for (const key of editableFields) {
    if (updateData[key] !== undefined) {
      address[key] = updateData[key];
    }
  }

  await address.save();

  return address;
};

export const removeUserAddress = async ({ userId, addressId }) => {
  const address = await UserAddress.findById(addressId);

  if (!address) {
    throw createHttpError("Address not found", 404);
  }

  if (address.user_id.toString() !== userId.toString()) {
    throw createHttpError("Forbidden", 403);
  }

  const wasDefault = address.is_default;


  await address.deleteOne();

  if (wasDefault) {
    const nextAddress = await UserAddress.findOne({
      user_id: userId,
    }).sort({ createdAt: 1 });

    if (nextAddress) {
      nextAddress.is_default = true;
      await nextAddress.save();
    }
  }
};

export const deleteUserAccount = async ({ userId, email }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  const orders = await Order.find({ userId }).select("_id").lean();
  const orderIds = orders.map((order) => order._id);
  const cart = await Cart.findOne({ user_id: userId }).select("_id").lean();

  await Promise.all([
    AuthSession.deleteMany({ user_id: userId }),
    UserAddress.deleteMany({ user_id: userId }),
    UserLocation.deleteMany({ user_id: userId }),
    FoodReview.deleteMany({ user_id: userId }),
    KitchenReview.deleteMany({ user_id: userId }),
    EmailVerificationOtp.deleteMany({ email }),
    PendingSignup.deleteMany({ email }),
    cart?._id ? CartItem.deleteMany({ cart_id: cart._id }) : Promise.resolve(),
    Cart.deleteMany({ user_id: userId }),
    orderIds.length ? OrderItem.deleteMany({ orderId: { $in: orderIds } }) : Promise.resolve(),
    orderIds.length ? OrderPricing.deleteMany({ orderId: { $in: orderIds } }) : Promise.resolve(),
    orderIds.length ? OrderStatusHistory.deleteMany({ orderId: { $in: orderIds } }) : Promise.resolve(),
    Payment.deleteMany({ userId }),
    Order.deleteMany({ userId }),
    user.deleteOne(),
  ]);
};
