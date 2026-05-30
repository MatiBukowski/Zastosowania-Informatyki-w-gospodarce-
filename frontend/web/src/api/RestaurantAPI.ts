import { apiClient } from './API';
import {IRestaurant, ITable, IPaginatedResponse, ISingleRestaurant} from '../context/interfaces';

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (page: number = 1, size: number = 10): Promise<IPaginatedResponse<IRestaurant>> => {
  const response = await apiClient.get<IPaginatedResponse<IRestaurant>>('/api/restaurants', {
    params: { page, size }
  });
  return response.data;
};

export const getRestaurantsByUser = async (page: number = 1, size: number = 10): Promise<IPaginatedResponse<IRestaurant>> => {
  const response = await apiClient.get<IPaginatedResponse<IRestaurant>>('/api/restaurants/my', {
    params: { page, size }
  });
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};

export const getSingleRestaurantById = async (id: number): Promise<ISingleRestaurant> => {
  const response = await apiClient.get<ISingleRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};

export const getTablesByRestaurantId = async (restaurantId: number, page: number = 1, size: number = 10): Promise<IPaginatedResponse<ITable>> => {
  const response = await apiClient.get<IPaginatedResponse<ITable>>(`/api/restaurants/${restaurantId}/tables`, {
    params: { page, size }
  });
  return response.data;
};