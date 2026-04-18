import {PostHog} from "posthog-react-native";

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"

if (!POSTHOG_KEY) {
    throw new Error('PostHog API key is not defined')
}

export const posthogClient = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    errorTracking: {
    autocapture: {
      uncaughtExceptions: true,
      unhandledRejections: true,
      console: ['error', 'warn'],
    },
  },
})