import { Stack } from "expo-router";
import { theme } from "../theme/theme";

export default function RootLayout() {
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

  );
}

