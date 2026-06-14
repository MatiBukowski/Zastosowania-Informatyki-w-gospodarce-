import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { posthogClient } from '@/analitics/analitics'
import { reportApplicationError } from '@/services/errorReporting';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const sessionId = posthogClient.getSessionId()
  const distinctId = posthogClient.getDistinctId()

  if (sessionId) config.headers['X-POSTHOG-SESSION-ID'] = sessionId
  if (distinctId) config.headers['X-POSTHOG-DISTINCT-ID'] = distinctId
  if (!config.headers.Authorization) {
    const token = await AsyncStorage.getItem('user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    reportApplicationError(error);
    return Promise.reject(error);
  }
);
