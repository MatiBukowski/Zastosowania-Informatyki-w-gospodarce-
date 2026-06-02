import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { useGetRestaurantMenu } from '@/services/hooks/useRestaurants';
import { theme } from '@/ui/theme/theme';
import { usePostHog } from 'posthog-react-native';

export default function RestaurantMenuView() {
  const { id, tableId, reservationId } = useLocalSearchParams<{ id: string; tableId?: string; reservationId?: string }>();
  const { menu, loading, error } = useGetRestaurantMenu(Number(id));
  const posthog = usePostHog();
  const router = useRouter();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: 50 }}>

      <Stack.Screen options={{ headerShown: false }} />

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ marginRight: 15, padding: 5 }}
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>
          Menu
        </Text>
      </View>


      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {menu.map((item) => (
          <View
            key={item.menu_item_id}
            style={{
              marginBottom: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.1)',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, flex: 1 }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 10 }}>
                {item.price} zł
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 5, lineHeight: 20 }}>
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
