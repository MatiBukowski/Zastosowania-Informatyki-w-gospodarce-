import { apiClient } from './API';
import { IRestaurant } from '../context/interfaces';

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<IRestaurant[]> => {
  const response = await apiClient.get<IRestaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};