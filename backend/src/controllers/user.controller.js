
import { sendResponse } from "../utils/sendResponse.js";
import {
  createUserAddress,
  deleteUserAccount,
  editUserAddress,
  listUserAddresses,
  removeUserAddress,
  updateUserProfile,
} from "../services/user.service.js";

// GET CURRENT USER
export const getMe = async (req, res, next) => {
  try {
    sendResponse(res, {
      message: "User profile fetched successfully",
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.validatedBody;

    const user = await updateUserProfile({
      userId: req.user._id,
      name,
    });


    sendResponse(res, {
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const addressData = req.validatedBody;

    const address = await createUserAddress({
      userId: req.user._id,
      addressData,
    });


    sendResponse(res, {
      message: "Address added successfully",
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await listUserAddresses(req.user._id);

    sendResponse(res, {
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await editUserAddress({
      userId: req.user._id,
      addressId: id,
      updateData: req.validatedBody,
    });


    sendResponse(res, {
      message: "Address updated successfully",
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    await removeUserAddress({
      userId: req.user._id,
      addressId: id,
    });

    sendResponse(res, {
      message: "Address deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await deleteUserAccount({
      userId: req.user._id,
      email: req.user.email,
    });

    sendResponse(res, {
      message: "Account deleted permanently",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
