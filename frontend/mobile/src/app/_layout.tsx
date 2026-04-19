import {Stack, useGlobalSearchParams, usePathname} from "expo-router";
import { theme } from "../theme/theme";
import {PostHogProvider} from 'posthog-react-native'
import {useEffect} from "react";
import { posthogClient } from '@/analitics/analitics';

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <PostHogProvider client={posthogClient}>
        <Stack
          screenOptions={{
            // global header
            headerStyle: {
              //headerShown: false,
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.white,
            headerTitleStyle: {
              fontWeight: "800",
              fontSize: 20,
            },
            // global background
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
          }}
        >
        </Stack>
    </PostHogProvider>
  );
}

