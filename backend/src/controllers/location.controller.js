import { saveUserLocation } from "../services/location.service.js";
import { sendResponse } from "../utils/sendResponse.js";

export const createUserLocation = async (req, res, next) => {
  try {
    const location = await saveUserLocation({
      userId: req.user._id,
      locationData: req.validatedBody,
    });

    sendResponse(res, {
      statusCode: 201,
      message: "User location saved successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
};
