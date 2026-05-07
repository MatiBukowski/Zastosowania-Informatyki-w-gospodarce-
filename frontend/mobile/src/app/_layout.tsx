import {Stack, useGlobalSearchParams, usePathname} from "expo-router";
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from "../theme/theme";
import {PostHogProvider} from 'posthog-react-native'
import {useEffect} from "react";
import { posthogClient } from '@/analitics/analitics';
import BottomNavBar from '@/components/BottomNavBar';

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <PostHogProvider client={posthogClient}>
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 16, paddingVertical: 8 }} edges={['top', 'left', 'right']}>
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
        </SafeAreaView>
        <BottomNavBar />
      </View>
    </PostHogProvider>
  );
}

