import api from "../api/axios";

export async function fetchRestaurants(params = {}) {
  const response = await api.get("/api/kitchen", { params });
  return response.data;
}

export async function fetchFoodCategories() {
  const response = await api.get("/api/kitchen/catalog/categories");
  return response.data;
}

export async function fetchFoods(params = {}) {
  const response = await api.get("/api/kitchen/catalog/foods", { params });
  return response.data;
}

export async function fetchPopularFoods() {
  const response = await api.get("/api/kitchen/catalog/popular-foods");
  return response.data;
}

export async function fetchRestaurantDetails(restaurantId, params = {}) {
  const response = await api.get(`/api/kitchen/${restaurantId}`, { params });
  return response.data;
}

export async function fetchRestaurantsByFood(foodId, params = {}) {
  const response = await api.get(`/api/kitchen/food/${foodId}`, { params });
  return response.data;
}

export async function fetchRestaurantsByMenu(menuSlug, params = {}) {
  const response = await api.get(`/api/search/menu/${menuSlug}`, { params });
  return response.data.data;
}
