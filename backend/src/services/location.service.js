import UserLocation from "../models/user/location.model.js";

export const saveUserLocation = async ({ userId, locationData }) =>
  UserLocation.create({
    user_id: userId,
    ...locationData,
  });
