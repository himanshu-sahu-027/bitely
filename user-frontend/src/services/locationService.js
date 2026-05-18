import axios from "axios";

const nominatimClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {
    Accept: "application/json",
    "Accept-Language": "en",
  },
  timeout: 10000,
});

export const reverseGeocodeRequest = async (latitude, longitude) => {
  const { data } = await nominatimClient.get("/reverse", {
    params: {
      format: "jsonv2",
      lat: latitude,
      lon: longitude,
      addressdetails: 1,
      zoom: 18,
    },
  });

  return data;
};

export const forwardGeocodeRequest = async (query) => {
  const { data } = await nominatimClient.get("/search", {
    params: {
      format: "jsonv2",
      q: query,
      addressdetails: 1,
      limit: 5,
    },
  });

  return data;
};
