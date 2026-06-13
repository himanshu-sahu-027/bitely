import { createHttpError } from "../utils/createHttpError.js";
import { sendResponse } from "../utils/sendResponse.js";
import {
  createUserAddress,
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
    const { name, email } = req.body;

    const user = await updateUserProfile({
      userId: req.user._id,
      name,
      email,
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
    const {
      label,
      address_line,
      city,
      state,
      pincode,
      latitude,
      longitude,
      is_default,
    } = req.body;

    if (!address_line || !city || !pincode) {
      throw createHttpError("Required fields missing", 400);
    }

    const address = await createUserAddress({
      userId: req.user._id,
      addressData: {
      label,
      address_line,
      city,
      state,
      pincode,
      latitude,
      longitude,
      is_default,
      },
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
      updateData: { ...req.body },
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
