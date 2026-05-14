import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { useGetRestaurantMenu } from '@/hooks/useRestaurants';
import { theme } from '@/ui/theme/theme';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';

export default function RestaurantMenuView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menu, loading, error } = useGetRestaurantMenu(Number(id));
  const posthog = usePostHog();

  useEffect(() => {
    if (menu && menu.length > 0) {
      posthog.capture('restaurant_menu_viewed', {
        restaurant_id: id,
        item_count: menu.length
      });
    } else if (error || (menu && menu.length === 0)) {
        posthog.capture('restaurant_menu_fetch_failed', {
            restaurant_id: id,
            error: error || 'Empty menu'
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
    <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 4, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: 30, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text }}>
          Menu
        </Text>

        {menu.map((item) => (
          <View
            key={item.menu_item_id}
            style={{
              marginBottom: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#666',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{item.name}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary }}>{item.price} zł</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 5, lineHeight: 20 }}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
