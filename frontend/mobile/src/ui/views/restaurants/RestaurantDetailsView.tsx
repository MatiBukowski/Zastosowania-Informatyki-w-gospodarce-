import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

import { useGetRestaurantById } from '@/hooks/useRestaurants';
import { theme } from '@/ui/theme/theme';

export default function RestaurantDetailsView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const posthog = usePostHog();
  const { restaurant, loading, error } = useGetRestaurantById(Number(id));

  useEffect(() => {
    if (restaurant) {
      posthog.capture('restaurant_details_viewed', {
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.name,
        cuisine: restaurant.cuisine,
      });
    }
  }, [posthog, restaurant]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', marginBottom: 16 }}>{error ?? 'Not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={theme.typography.h4}>{restaurant.name}</Text>
      <Text style={[theme.typography.body, styles.address]}>{restaurant.address}</Text>

      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{restaurant.cuisine}</Text>
        </View>
        {restaurant.has_kiosk && (
          <View style={[styles.tag, { backgroundColor: '#2e7d32' }]}>
            <Text style={styles.tagText}>Kiosk available</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => {
          posthog.capture('reservation_button_clicked', {
            restaurant_id: restaurant.restaurant_id,
            restaurant_name: restaurant.name,
          });
          router.push(`/restaurants/${restaurant.restaurant_id}/tables`);
        }}
      >
        <Text style={styles.buttonTextPrimary}>Reserve a table</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => {
          posthog.capture('menu_button_clicked', {
            restaurant_id: restaurant.restaurant_id,
            restaurant_name: restaurant.name,
          });
          router.push(`/restaurants/${restaurant.restaurant_id}/menu`);
        }}
      >
        <Text style={styles.buttonTextSecondary}>See menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingVertical: 20, paddingHorizontal: 4 },
  address: { color: theme.colors.text, marginTop: 6, marginBottom: 12 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: '#fff', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonTextPrimary: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonTextSecondary: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
});
