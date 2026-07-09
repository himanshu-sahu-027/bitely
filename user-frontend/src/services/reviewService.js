import api from "../api/axios";

export const getKitchenReviews = async (kitchenId) => {
  const response = await api.get(`/api/reviews/kitchen/${kitchenId}`);

  return response.data;
};

export const getFoodReviews = async (menuId) => {
  const response = await api.get(`/api/reviews/food/${menuId}`);

  return response.data;
};

export const addKitchenReview = async (kitchenId, payload) => {
  const response = await api.post(`/api/reviews/kitchen/${kitchenId}`, payload);

  return response.data;
};

export const addFoodReview = async (menuId, payload) => {
  const response = await api.post(`/api/reviews/food/${menuId}`, payload);

  return response.data;
};

export const updateKitchenReview = async (reviewId, payload) => {
  const response = await api.put(`/api/reviews/kitchen/${reviewId}`, payload);

  return response.data;
};

export const deleteKitchenReview = async (reviewId) => {
  const response = await api.delete(`/api/reviews/kitchen/${reviewId}`);

  return response.data;
};

export const updateFoodReview = async (reviewId, payload) => {
  const response = await api.put(`/api/reviews/food/${reviewId}`, payload);

  return response.data;
};

export const deleteFoodReview = async (reviewId) => {
  const response = await api.delete(`/api/reviews/food/${reviewId}`);

  return response.data;
};
