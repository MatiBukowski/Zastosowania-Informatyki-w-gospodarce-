import { apiClient } from './API';
import {IRestaurant} from '@/context/interfaces';
import { ITable } from '@/context/interfaces'

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<IRestaurant[]> => {
  const response = await apiClient.get<IRestaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};

export const getTablesByRestaurantId = async (restaurantId: number): Promise<ITable[]> => {
  const response = await apiClient.get<ITable[]>(`/api/restaurants/${restaurantId}/tables`);
  return response.data;
};

export const postTable = async (restaurantId: number, tableData: ICreateTable): Promise<ITable> => {
  const response = await apiClient.post<ITable>(`/api/restaurants/${restaurantId}/tables`, tableData);
  return response.data;
};