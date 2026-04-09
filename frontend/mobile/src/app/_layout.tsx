import { Stack } from "expo-router";
import { theme } from "../theme/theme";

export default function RootLayout() {
  return (
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

  );
}

