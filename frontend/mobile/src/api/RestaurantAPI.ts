import { apiClient } from './API';
import { Restaurant } from '../context/interfaces';

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await apiClient.get<Restaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<Restaurant> => {
  const response = await apiClient.get<Restaurant>(`/api/restaurants/${id}`);
  return response.data;
};