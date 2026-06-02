import { apiClient } from './API';
import { ICreateOrder } from '@/services/interfaces/interfaces';

export const createOrder = async (data: ICreateOrder) => {
  const response = await apiClient.post('/api/orders', data);
  return response.data;
};