import {Stack, useGlobalSearchParams, usePathname} from "expo-router";
import { theme } from "../theme/theme";
import {PostHogProvider} from 'posthog-react-native'
import {useEffect} from "react";
import { posthogClient } from '@/analitics/analitics';

export default function RootLayout() {
<<<<<<< HEAD
  const pathname = usePathname();
  const params = useGlobalSearchParams();
=======
  return (
    <Stack
      screenOptions={{
        // global header
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
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
>>>>>>> 448bbd5eb86fba9d5e7a9855b5b99088de29b14b

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <PostHogProvider client={posthogClient}>
        <Stack
          screenOptions={{
            // global header
            headerStyle: {
                  backgroundColor: theme.colors.background,
            },
            headerShown: false,
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

