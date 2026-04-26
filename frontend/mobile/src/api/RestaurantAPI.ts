import { apiClient } from './API';
import { IRestaurant } from '@/context/interfaces';

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<IRestaurant[]> => {
  const response = await apiClient.get<IRestaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};


export const getMenuByRestaurantId = async (id: number): Promise<IMenuItem[]> => {
  try {
    const response = await apiClient.get(`/api/restaurants/${id}/menu`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${id}:`, error);
    throw error;
  }
};


export const getTablesByRestaurantId = async (restaurantId: number): Promise<ITable[]> => {
  const response = await apiClient.get<ITable[]>(`/api/restaurants/${restaurantId}/tables`);
  return response.data;
};