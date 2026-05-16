import { apiClient } from './API';
import { IRestaurant, IMenuItem, ITable, ICreateTable } from '@/services/interfaces/interfaces';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';

export const getRestaurants = async (params: {search? : string | null} & IRestaurantFilters): Promise<IRestaurant[]> => {
  const response = await apiClient.get<IRestaurant[]>('/api/restaurants', { params });
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

export const postTable = async (restaurantId: number, tableData: ICreateTable): Promise<ITable> => {
  const response = await apiClient.post<ITable>(`/api/restaurants/${restaurantId}/tables`, tableData);
  return response.data;
};