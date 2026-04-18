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