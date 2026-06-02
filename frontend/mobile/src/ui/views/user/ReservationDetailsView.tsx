import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/ui/theme/theme';
import { useGetMyReservations, useUpdateReservation } from '@/services/hooks/useReservations';
import { useGetRestaurantById, useGetTablesByRestaurantId } from '@/services/hooks/useRestaurants';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { ReservationStatus } from '@/services/interfaces/interfaces';

export default function ReservationDetailsView() {
  const router = useRouter();
  const { id, restaurantId } = useLocalSearchParams();

  const { reservations, loading: resLoading, refresh: refreshReservations } = useGetMyReservations();
  const reservation = reservations?.find(r => r.reservation_id.toString() === id);

  const { restaurant, loading: restLoading } = useGetRestaurantById(Number(restaurantId));
  const { tables, loading: tablesLoading } = useGetTablesByRestaurantId(Number(restaurantId));
  const table = tables?.find(t => t.table_id === reservation?.table_id);
  const { update, loading: updateLoading } = useUpdateReservation();

  const handleCancel = () => {
      Alert.alert(
        "Cancel Reservation",
        "Are you sure you want to cancel this reservation?",
        [
          { text: "Keep it", style: "cancel" },
          {
            text: "Yes, cancel",
            style: "destructive",
            onPress: async () => {
              if (!reservation) return;
              const success = await update(reservation.reservation_id, { status: ReservationStatus.CANCELED });
              if (success) {
                router.back();
              } else {
                Alert.alert("Error", "Failed to cancel reservation.");
              }
            }
          }
        ]
      );
    };
  if (resLoading || restLoading || tablesLoading) {
    return (
      <ScreenLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!reservation) {
    return (
      <ScreenLayout>
        <View style={styles.center}>
          <Text style={styles.errorText}>Reservation not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.colors.primary }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  const dateObj = new Date(reservation.reservation_time.endsWith('Z') ? reservation.reservation_time : `${reservation.reservation_time}Z`);
  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* close button*/}
        <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Reservation Details</Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>


        {/* Reservation details */}
        <View style={theme.common.card}>
          <Text style={styles.sectionTitle}>Restaurant Info</Text>
          <Text style={styles.restaurantName}>{restaurant?.name || 'Loading...'}</Text>
          <Text style={styles.infoText}>
            {restaurant ? `${restaurant.street} ${restaurant.building_number}, ${restaurant.postal_code} ${restaurant.city}` : ''}
          </Text>

          {restaurant?.phone_number && restaurant.phone_number.trim() !== '' ? (
            <View style={[styles.detailRow, { marginTop: 8 }]}>
              <Ionicons name="call-outline" size={16} color={theme.colors.gray} />
              <Text style={[styles.infoText, { marginLeft: 6 }]}>{restaurant.phone_number}</Text>
            </View>
          ) : null}
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Booking Info</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>{formattedTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="scan-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>Table Number: {reservation.table_id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>Table Capacity: {table?.capacity ? `${table.capacity} people` : 'N/A'}</Text>          </View>
          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>Status: {reservation.status}</Text>
          </View>
        </View>

        {/* menu -> will be changed to ordering */}
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: "/tabs/restaurants/[id]/menu",
            params: { id: restaurantId }
          })}
        >
          <Ionicons name="restaurant-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.menuButtonText}>See Menu</Text>
        </TouchableOpacity>
        {(reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED) ? (
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={handleCancel}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator color="#F44336" />
            ) : (
              <View style={styles.cancelButtonContent}>
                <Ionicons name="close-circle-outline" size={24} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40 ,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
    width: '100%',
  },

  pageTitle: {
    ...theme.typography.h4,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    zIndex: 10,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.gray,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  restaurantName: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    ...theme.typography.body,
    marginLeft: 10,
    color: theme.colors.text,
  },
  errorText: {
    ...theme.typography.h6,
    color: theme.colors.gray,
  },
  menuButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cancelButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  }
});