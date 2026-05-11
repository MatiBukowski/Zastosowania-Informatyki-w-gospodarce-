import { apiClient } from './API';
import { IReservation, ICreateReservation } from '@/context/interfaces';

export const getReservationsByTableId = async (tableId: number): Promise<IReservation[]> => {
    const response = await apiClient.get<IReservation[]>(`/api/tables/${tableId}/reservation`);
    return response.data;
};

export const createReservation = async (tableId: number, data: ICreateReservation): Promise<IReservation> => {
    const response = await apiClient.post<IReservation>(`/api/tables/${tableId}/reservation`, data);
    return response.data;
};

export const getReservationById = async (reservationId: number): Promise<IReservation> => {
    const response = await apiClient.get<IReservation>(`/api/reservations/${reservationId}`);
    return response.data;
};

export const updateReservation = async (reservationId: number, data: Partial<ICreateReservation>): Promise<IReservation> => {
    const response = await apiClient.patch<IReservation>(`/api/reservations/${reservationId}`, data);
    return response.data;
};