import { apiClient } from './API';
import { ILoginRequest, ILoginResponse } from '@/context/interfaces';


export const loginUser = async (data: ILoginRequest): Promise<ILoginResponse> => {
    const response = await apiClient.post<ILoginResponse>('/api/auth/login', data);
    return response.data;
};

export const logoutUser = async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
};


