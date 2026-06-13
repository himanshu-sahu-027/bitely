import User from "../models/user/user.model.js";
import UserAddress from "../models/user/address.model.js";
import { createHttpError } from "../utils/createHttpError.js";

export const updateUserProfile = async ({ userId, name, email }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError("User not found", 404);
  }

  if (name) {
    user.name = name;
  }

  if (email) {
    const existing = await User.findOne({ email });

    if (existing && existing._id.toString() !== user._id.toString()) {
      throw createHttpError("Email already in use", 400);
    }

    user.email = email;
    // Require re-verification after email change
    user.isVerified = false;
    user.authProvider = user.authProvider || "email";
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
    throw createHttpError("Unauthorized", 401);
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

  Object.assign(address, updateData);
  await address.save();

  return address;
};

export const removeUserAddress = async ({ userId, addressId }) => {
  const address = await UserAddress.findById(addressId);

  if (!address) {
    throw createHttpError("Address not found", 404);
  }

  if (address.user_id.toString() !== userId.toString()) {
    throw createHttpError("Unauthorized", 401);
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
