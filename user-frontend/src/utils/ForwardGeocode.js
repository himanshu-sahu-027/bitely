import { forwardGeocodeRequest } from "../services/locationService";

const getCityValue = (address = {}) =>
  address.city ||
  address.town ||
  address.village ||
  address.municipality ||
  address.hamlet ||
  address.county ||
  "";

export default async function forwardGeocode(query) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    throw new Error("Enter an address or place name to search.");
  }

  try {
    const data = await forwardGeocodeRequest(cleanedQuery);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No matching places found. Try a more specific search.");
    }

    return data.map((item) => ({
      id: item.place_id,
      label: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      city: getCityValue(item.address),
      state: item.address?.state || item.address?.state_district || "",
      pincode: item.address?.postcode || "",
      addressLine: item.address?.road || item.address?.suburb || "",
      rawAddress: item.address ?? {},
    }));
  } catch (error) {
    if (error.response) {
      throw new Error("Search is unavailable right now. Please try again.");
    }

    throw error;
  }
}
