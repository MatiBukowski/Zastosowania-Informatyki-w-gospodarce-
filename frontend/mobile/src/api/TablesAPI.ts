import { apiClient } from './API';
import { ITable, ICreateTable } from '@/context/interfaces';

export const resolveTableByToken = async (token: string): Promise<ITable> => {
  const response = await apiClient.get<ITable>(`/api/tables/resolve/${token}`);
  return response.data;
};