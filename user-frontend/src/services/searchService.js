import api from "../api/axios";

export const searchFoodsAndKitchens = async (query) => {
  const response = await api.get("/api/kitchen/search", {
    params: {
      q: query,
    },
  });

  return response.data.data;
};
