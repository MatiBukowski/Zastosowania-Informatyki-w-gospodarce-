import { useEffect, useState } from 'react';
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
import StyledButton from '@/ui/components/buttons/StyledButton';

export default function RestaurantDetailsView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const posthog = usePostHog();
  const { restaurant, loading, error } = useGetRestaurantById(Number(id));
  const [isSchedulesExpanded, setIsSchedulesExpanded] = useState(false);
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

        <Text style={[theme.typography.body, styles.address]}>
          {`${restaurant.street} ${restaurant.building_number}, ${restaurant.postal_code} ${restaurant.city}`}
        </Text>

        {restaurant.phone_number && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.gray} />
            <Text style={[theme.typography.body, styles.phoneText]} numberOfLines={1}>
              {restaurant.phone_number}
            </Text>
          </View>
        )}



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

        <Text style={[theme.typography.h6, styles.sectionTitle]}>About</Text>
        <Text style={[theme.typography.body, styles.descriptionText]}>
          {restaurant.description || "No description available."}
        </Text>

        {restaurant.schedules && restaurant.schedules.length > 0 && (
          <>
            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSchedulesExpanded(!isSchedulesExpanded)}
              style={[
                styles.schedulesHeader,
                { marginBottom: isSchedulesExpanded ? 12 : 0 }
              ]}
            >
              <View style={styles.schedulesTitleRow}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} style={styles.schedulesIcon} />
                <Text style={styles.schedulesTitle}>Opening Hours</Text>
              </View>

              <Ionicons
                name={isSchedulesExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.gray}
              />
            </TouchableOpacity>

            {isSchedulesExpanded && (
              <View style={styles.schedulesListContainer}>
                {restaurant.schedules.map((schedule, index) => (
                  <View key={index} style={styles.scheduleRow}>
                    <Text style={[theme.typography.body, styles.scheduleDay]}>
                      {schedule.day_of_week.toLowerCase()}
                    </Text>
                    <Text style={[theme.typography.body, styles.scheduleTime]}>
                      {schedule.open_time.slice(0, 5)} - {schedule.close_time.slice(0, 5)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <StyledButton
          variant="primary"
          accessibilityLabel="Reserve a table"
          onPress={() => {
            posthog.capture('reservation_button_clicked', {
              restaurant_id: restaurant.restaurant_id,
              restaurant_name: restaurant.name,
            });
            router.push({
                  pathname: "/tabs/restaurants/[id]/reservation",
                  params: { id: restaurant.restaurant_id }
            });
          }}
      >
        Reserve a table
      </StyledButton>

      <StyledButton
          variant="secondary"
          accessibilityLabel="See menu"
          onPress={() => {
            posthog.capture('menu_button_clicked', {
              restaurant_id: restaurant.restaurant_id,
              restaurant_name: restaurant.name,
            });
            router.push({
                  pathname: "/tabs/restaurants/[id]/menu",
                  params: { id: restaurant.restaurant_id }
            });
          }}
      >
        See menu
      </StyledButton>
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
sectionTitle: {
    color: theme.colors.text,
    marginBottom: 8
  },
  descriptionText: {
    color: theme.colors.text
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16
  },
  schedulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schedulesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  schedulesIcon: {
    marginRight: 8
  },
  schedulesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text
  },
  schedulesListContainer: {
    marginTop: 4
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  scheduleDay: {
    color: theme.colors.gray,
    textTransform: 'capitalize'
  },
  scheduleTime: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  phoneText: {
    color: theme.colors.text,
    marginLeft: 6,
    flex: 1,
  },
});