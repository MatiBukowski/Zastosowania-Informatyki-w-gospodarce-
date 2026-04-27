import axios from 'axios';
import posthog from "posthog-js";

// Use one Axios API for all request's.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-POSTHOG-DISTINCT-ID'] = posthog.get_distinct_id()
  config.headers['X-POSTHOG-SESSION-ID']  = posthog.get_session_id()
  return config
})

