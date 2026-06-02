import React, { useEffect } from 'react';
import { View, ActivityIndicator, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { useGetRestaurantMenu } from '@/services/hooks/useRestaurants';
import { theme } from '@/ui/theme/theme';
import { usePostHog } from 'posthog-react-native';
import RestaurantMenuOrderingPanel from './RestaurantMenuOrderingPanel';

export default function RestaurantMenuOrderingView() {
  const { id, tableId, reservationId } = useLocalSearchParams<{ id: string; tableId?: string; reservationId?: string }>();
  const { menu, loading, error } = useGetRestaurantMenu(Number(id));
  const posthog = usePostHog();

  useEffect(() => {
    if (menu && menu.length > 0) {
      posthog.capture('restaurant_menu_viewed_for_ordering', {
        restaurant_id: id,
        item_count: menu.length,
      });
    } else if (error || (menu && menu.length === 0)) {
      posthog.capture('restaurant_menu_fetch_failed_for_ordering', {
        restaurant_id: id,
        error: error || 'Empty menu',
      });
    }
  }, [menu, error]);

  if (loading) {
    return (
      <View style={theme.common.screenContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!menu || menu.length === 0 || error) {
    return (
      <View style={theme.common.screenContainer}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 100,
          }}
        >
          <Text style={[theme.typography.h5, { color: theme.colors.text }]}>No menu available</Text>
          <Text style={[theme.typography.caption, { marginTop: 8 }]}>Check back later!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 12, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={{ paddingTop: 30, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text }}>Menu</Text>

        <RestaurantMenuOrderingPanel
          restaurantId={Number(id)}
          menu={menu}
          tableId={tableId}
          reservationId={reservationId}
        />
      </ScrollView>
    </View>
  );
}
