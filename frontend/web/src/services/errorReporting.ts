import axios from 'axios';
import posthog from 'posthog-js';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';

type ErrorProperties = Record<string, string | number | boolean | null>;

function compactProperties(properties: Record<string, unknown>): ErrorProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  ) as ErrorProperties;
}

export function reportApplicationError(error: unknown, properties: Record<string, unknown> = {}) {
  const cleanProperties = compactProperties(properties);

  if (axios.isAxiosError(error)) {
    posthog.captureException(error, compactProperties({
      type: 'api_error',
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      ...cleanProperties,
    }));
    return;
  }

  posthog.captureException(error instanceof Error ? error : new Error(String(error)), cleanProperties);
}

export function getUserFacingErrorMessage(error: unknown, fallback = GENERIC_ERROR_MESSAGE) {
  if (axios.isAxiosError(error) && !error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  return fallback;
}
