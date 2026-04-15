import axios from 'axios';
import { IRestaurant } from '../context/interfaces';
import posthog from "posthog-js";

// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-POSTHOG-DISTINCT-ID'] = posthog.get_distinct_id()
  config.headers['X-POSTHOG-SESSION-ID']  = posthog.get_session_id()
  return config
})

// Add restaurants API client functions: getRestaurants(), getRestaurantById(id).
export const getRestaurants = async (): Promise<IRestaurant[]> => {
  const response = await apiClient.get<IRestaurant[]>('/api/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<IRestaurant> => {
  const response = await apiClient.get<IRestaurant>(`/api/restaurants/${id}`);
  return response.data;
};