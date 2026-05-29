import axios from 'axios';
import { posthogClient } from '@/analitics/analitics'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const sessionId = posthogClient.getSessionId()
  const distinctId = posthogClient.getDistinctId()

  if (sessionId) config.headers['X-POSTHOG-SESSION-ID'] = sessionId
  if (distinctId) config.headers['X-POSTHOG-DISTINCT-ID'] = distinctId

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Capture 500+ and connection/network errors to PostHog
    if (!error.response || error.response.status >= 500) {
      posthogClient.captureException(error, {
        type: 'api_error',
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);