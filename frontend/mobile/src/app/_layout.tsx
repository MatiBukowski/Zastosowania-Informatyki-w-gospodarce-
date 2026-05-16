import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { PostHogProvider } from 'posthog-react-native'
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { posthogClient } from '@/analitics/analitics';
import { AuthProvider } from '@/services/providers/AuthProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PostHogProvider client={posthogClient}>
          <Stack screenOptions={{ headerShown: false }}/>
        </PostHogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

