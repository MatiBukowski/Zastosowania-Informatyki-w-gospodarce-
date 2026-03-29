
import axios from 'axios';
import { Restaurant } from '../context/types';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL;


// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await apiClient.get<Restaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<Restaurant> => {
  const response = await apiClient.get<Restaurant>(`/api/restaurants/${id}`);
  return response.data;
};