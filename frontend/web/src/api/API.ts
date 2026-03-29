
import axios from 'axios';
import { Restaurant } from '../context/types';

// Leave BASE_URL empty for Web to trigger Vite Proxy (see vite.config.ts).
// to handle requests and bypass CORS 
const BASE_URL = '';


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