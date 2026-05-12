import { apiClient } from './API';
import { IOrder, ICreateOrder } from '../context/interfaces';

export const createOrder = async (data: ICreateOrder): Promise<IOrder> => {
    const response = await apiClient.post<IOrder>('/api/orders', data);
    return response.data;
};

export const getOrderById = async (orderId: number): Promise<IOrder> => {
    const response = await apiClient.get<IOrder>(`/api/orders/${orderId}`);
    return response.data;
};

export const cancelOrder = async (orderId: number): Promise<IOrder> => {
    const response = await apiClient.patch<IOrder>(`/api/orders/${orderId}/cancel`);
    return response.data;
};