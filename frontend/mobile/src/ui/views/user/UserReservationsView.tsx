import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/ui/theme/theme';
import { useAuth } from '@/services/providers/AuthProvider';
import { IReservation, ReservationStatus } from '@/services/interfaces/interfaces';
import { useGetMyReservations } from '@/services/hooks/useReservations';

export default function UserReservationsView() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const { reservations, loading: isLoading, refresh } = useGetMyReservations();

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

  const renderReservationCard = ({ item }: { item: IReservation }) => {
    const utcString = item.reservation_time.endsWith('Z')
      ? item.reservation_time
      : `${item.reservation_time}Z`;
    const dateObj = new Date(utcString);

    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/reservations/${item.reservation_id}` as any)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.restaurantName}>Restaurant #{item.restaurant_id}</Text>
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

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text }}>Log in to see your reservations.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Reservations</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.reservation_id.toString()}
          renderItem={renderReservationCard}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
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
    paddingTop: 20,
    backgroundColor: '#FAFAFA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
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
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  }
});