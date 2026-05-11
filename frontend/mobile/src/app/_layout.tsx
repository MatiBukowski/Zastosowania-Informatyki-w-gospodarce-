import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { PostHogProvider } from 'posthog-react-native'
import { useEffect } from "react";

import { posthogClient } from '@/analitics/analitics';
import ThemeProvider from "@/ui/theme/ThemeProvider";
import { AuthProvider } from '../services/AuthProvider';

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <AuthProvider>
        <PostHogProvider client={posthogClient}>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}/>
          </ThemeProvider>
        </PostHogProvider>
    </AuthProvider>
  );
}

