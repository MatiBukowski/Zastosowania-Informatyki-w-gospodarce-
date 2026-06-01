import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { theme } from '@/ui/theme/theme';
import { useAuth } from '@/services/providers/AuthProvider';
import { IReservation, ReservationStatus } from '@/services/interfaces/interfaces';
import { useGetMyReservations} from '@/services/hooks/useReservations';
import { useGetRestaurantById } from '@/services/hooks/useRestaurants';

  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return { color: '#4CAF50', bg: '#E8F5E9', label: 'Confirmed' };
      case ReservationStatus.PENDING:
        return { color: '#FF9800', bg: '#FFF3E0', label: 'Pending' };
      case ReservationStatus.CANCELED:
        return { color: '#F44336', bg: '#FFEBEE', label: 'Canceled' };
      case ReservationStatus.COMPLETED:
        return { color: '#9E9E9E', bg: '#F5F5F5', label: 'Completed' };
      default:
        return { color: theme.colors.text, bg: '#EEE', label: status };
    }
  };



  const ReservationCard = ({ item }: { item: IReservation }) => {
    const router = useRouter();
    const { restaurant, loading } = useGetRestaurantById(item.restaurant_id);

    const utcString = item.reservation_time.endsWith('Z')
      ? item.reservation_time
      : `${item.reservation_time}Z`;
    const dateObj = new Date(utcString);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={[theme.common.card, styles.cardLayoutOverride]}
        activeOpacity={0.7}
        onPress={() => router.push({
                pathname: "/tabs/profile/reservationDetails",
                params: {
                  id: item.reservation_id,
                  restaurantId: item.restaurant_id
                }
              })}
        //onPress={() => router.push(`/reservations/${item.reservation_id}` as any)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {loading ? 'Loading...' : (restaurant?.name || `Restaurant #${item.restaurant_id}`)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.gray} />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
            <Text style={styles.detailText}>{formattedTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="scan-outline" size={16} color={theme.colors.gray} />
            <Text style={styles.detailText}>Table {item.table_id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


export default function UserReservationsView() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const { reservations, loading: isLoading, refresh } = useGetMyReservations();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text }}>Log in to see your reservations.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      <Text style={styles.pageTitle}>My Reservations</Text>
    </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.reservation_id.toString()}
          renderItem={({ item }) => <ReservationCard item={item} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.gray}/>
              <Text style={styles.emptyStateText}>You don't have any reservations yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 5,
    marginRight: 10,
  },
  pageTitle: {
    ...theme.typography.h4,
  color: theme.colors.text,
  },
  cardLayoutOverride: {
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  restaurantName: {
    ...theme.typography.h6,
    color: theme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    marginTop: 12,
    ...theme.typography.body,
    color: theme.colors.gray,
  }
});