import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { PostHogProvider } from 'posthog-react-native'
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { type ErrorBoundaryProps } from "expo-router";

import { posthogClient } from '@/analitics/analitics';
import { AuthProvider } from '@/services/providers/AuthProvider';

const queryClient = new QueryClient();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Uncaught error caught by mobile ErrorBoundary:", error);
    posthogClient.captureException(error, {
      platform: 'mobile',
    });
  }, [error]);

  return (
    <View style={errorStyles.container}>
      <View style={errorStyles.card}>
        <Text style={errorStyles.title}>Something Went Wrong</Text>
        <Text style={errorStyles.message}>
          An unexpected error occurred. This issue has been automatically reported to our team, and we are working to resolve it.
        </Text>
        <TouchableOpacity style={errorStyles.button} onPress={retry}>
          <Text style={errorStyles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthogClient.screen(pathname, params)
  }, [pathname, params]);

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthogClient}>
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}/>
        </AuthProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EBE8', // seashell
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#E54B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E54B4B', // strawberryRed
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#222217', // carbonBlack
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E54B4B', // strawberryRed
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});


