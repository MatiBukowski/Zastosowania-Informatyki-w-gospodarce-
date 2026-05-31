import { apiClient } from './API';
import { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse } from '@/services/interfaces/user';


export const loginUser = async (data: ILoginRequest): Promise<ILoginResponse> => {
    const response = await apiClient.post<ILoginResponse>('/api/auth/login', data);
    return response.data;
};

export const logoutUser = async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
};

export const registerUser = async (data: IRegisterRequest): Promise<IRegisterResponse> => {
    const response = await apiClient.post<IRegisterResponse>('/api/auth/register', data);
    return response.data;
};
