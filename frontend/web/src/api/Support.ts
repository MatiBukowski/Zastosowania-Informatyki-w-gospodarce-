import { apiClient } from './API';

export type SupportRequestType = 'account_creation' | 'access_issue' | 'general';

export interface SupportContactPayload {
  name: string;
  email: string;
  request_type: SupportRequestType;
  message: string;
  restaurant_name?: string;
  source?: string;
}

export interface SupportInfo {
  contact_email: string;
  onboarding_steps: string[];
}

export const getSupportInfo = () =>
  apiClient.get<SupportInfo>('/api/support/info').then((res) => res.data);

export const submitSupportRequest = (payload: SupportContactPayload) =>
  apiClient.post<{ message: string }>('/api/support/contact', payload).then((res) => res.data);
