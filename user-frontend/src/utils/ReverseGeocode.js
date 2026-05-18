import { reverseGeocodeRequest } from "../services/locationService";

const getCityValue = (address = {}) =>
  address.city ||
  address.town ||
  address.village ||
  address.municipality ||
  address.hamlet ||
  address.county ||
  "";

const getAddressLine = (address = {}) =>
  [
    address.house_number,
    address.road || address.pedestrian || address.footway,
    address.suburb || address.neighbourhood,
  ]
    .filter(Boolean)
    .join(", ");

export default async function reverseGeocode(latitude, longitude) {
  try {
    const data = await reverseGeocodeRequest(latitude, longitude);

    if (!data?.display_name) {
      throw new Error("No readable address found for this location.");
    }

    const address = data.address ?? {};

    return {
      latitude: Number(data.lat ?? latitude),
      longitude: Number(data.lon ?? longitude),
      displayAddress: data.display_name,
      addressLine: getAddressLine(address),
      city: getCityValue(address),
      state: address.state || address.state_district || "",
      pincode: address.postcode || "",
      rawAddress: address,
    };
  } catch (error) {
    if (error.response) {
      throw new Error("Unable to fetch address details right now.");
    }

    throw error;
  }
}
