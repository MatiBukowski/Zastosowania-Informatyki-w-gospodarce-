import { apiClient } from './API';
import { IRestaurant, IMenuItem, ITable, ICreateTable, IPaginatedResponse } from '@/services/interfaces/interfaces';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';

export const getRestaurants = async (params: {search? : string | null} & IRestaurantFilters, page: number = 1, size: number = 10): Promise<IPaginatedResponse<IRestaurant>> => {
  const response = await apiClient.get<IPaginatedResponse<IRestaurant>>('/api/restaurants', {
    params: { ...params, page, size }
  });
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};


export const getMenuByRestaurantId = async (id: number, page: number = 1, size: number = 50): Promise<IPaginatedResponse<IMenuItem>> => {
  try {
    const response = await apiClient.get<IPaginatedResponse<IMenuItem>>(`/api/restaurants/${id}/menu`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${id}:`, error);
    throw error;
  }
};


export const getTablesByRestaurantId = async (restaurantId: number, page: number = 1, size: number = 100): Promise<IPaginatedResponse<ITable>> => {
  const response = await apiClient.get<IPaginatedResponse<ITable>>(`/api/restaurants/${restaurantId}/tables`, {
    params: { page, size }
  });
  return response.data;
};

export const postTable = async (restaurantId: number, tableData: ICreateTable): Promise<ITable> => {
  const response = await apiClient.post<ITable>(`/api/restaurants/${restaurantId}/tables`, tableData);
  return response.data;
};