import api from "../api/axios";

export const searchMenusAndKitchens = async (query) => {
  const response = await api.get("/api/search", {
    params: {
      q: query,
    },
  });

  return response.data.data;
};
