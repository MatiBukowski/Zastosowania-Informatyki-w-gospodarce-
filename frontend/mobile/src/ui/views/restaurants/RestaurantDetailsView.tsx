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
import { Image as ExpoImage } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import { useGetRestaurantById } from '@/services/hooks/useRestaurants';
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
      <View style={[theme.common.card, styles.photoCard]}>
        {restaurant.photo ? (
          <ExpoImage
            style={styles.photo}
            source={{ uri: restaurant.photo }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialIcons name="image-not-supported" size={40} color={theme.colors.gray} />
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerSection}>
        <Text style={[theme.typography.h4, { color: theme.colors.text }]} numberOfLines={3} ellipsizeMode="tail">
          {restaurant.name}
        </Text>
        <Text style={[theme.typography.body, styles.address]}>{restaurant.address}</Text>

        <View style={styles.tags}>
          <View style={[styles.tag, styles.tagPrimary]}>
            <Text style={styles.tagText}>{restaurant.cuisine}</Text>
          </View>
          {restaurant.has_kiosk && (
            <View style={[styles.tag, styles.tagSecondary]}>
              <Text style={styles.tagText}>Kiosk available</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[theme.common.card, styles.descriptionCard]}>
        <Text style={[theme.typography.h6, { color: theme.colors.text, marginBottom: 8 }]}>About</Text>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {restaurant.description}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => {
          posthog.capture('reservation_button_clicked', {
            restaurant_id: restaurant.restaurant_id,
            restaurant_name: restaurant.name,
          });

          //router.push(`/restaurants/${restaurant.restaurant_id}/reservation`);
            router.push({
                  pathname: "/tabs/restaurants/[id]/reservation",
                  params: { id: restaurant.restaurant_id }
            });
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
            router.push({
                  pathname: "/tabs/restaurants/[id]/menu",
                  params: { id: restaurant.restaurant_id }
            });
          //router.push(`/restaurants/${restaurant.restaurant_id}/menu`);
        }}
      >
        <Text style={styles.buttonTextSecondary}>See menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingVertical: 16 },
  photoCard: {
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 8,
  },
  photo: {
    width: '100%',
    height: 220,
  },
  photoPlaceholder: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  address: { color: theme.colors.text, marginTop: 6, marginBottom: 12 },
  tags: { flexDirection: 'row', gap: 8 },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagPrimary: {
    backgroundColor: theme.colors.primary,
  },
  tagSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  tagText: { color: '#fff', fontSize: 12 },
  descriptionCard: {
    marginBottom: 16,
  },
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
