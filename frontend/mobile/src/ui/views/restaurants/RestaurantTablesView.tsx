import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { useGetTablesByRestaurantId } from '@/services/hooks/useRestaurants';
import { ITable, TableStatus } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';
import StyledButton from "@/ui/components/buttons/StyledButton";

function statusColor(status: TableStatus): string {
  switch (status) {
    case TableStatus.FREE:
      return '#2e7d32';
    case TableStatus.RESERVED:
      return '#e65100';
    case TableStatus.OCCUPIED:
      return '#c62828';
    default:
      return '#666';
  }
}

function statusLabel(status: TableStatus): string {
  switch (status) {
    case TableStatus.FREE:
      return 'Free';
    case TableStatus.RESERVED:
      return 'Reserved';
    case TableStatus.OCCUPIED:
      return 'Occupied';
    default:
      return status;
  }
}

function TableCard({ table, onReserve }: { table: ITable; onReserve: () => void }) {
  const isFree = table.status === TableStatus.FREE;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={theme.typography.h6}>Table #{table.table_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(table.status) }]}>
          <Text style={styles.statusText}>{statusLabel(table.status)}</Text>
        </View>
      </View>

      <Text style={theme.typography.caption}>
        Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
      </Text>

      <StyledButton
          onPress={onReserve}
          disabled={!isFree}
          accessibilityLabel={isFree ? "Reserve this table" : "Not free"}
      >
        {isFree ? "Reserve this table" : "Not free"}
      </StyledButton>
    </View>
  );
}

export default function RestaurantTablesView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const restaurantId = Number(id);
  const { tables, loading, error } = useGetTablesByRestaurantId(restaurantId);
  const posthog = usePostHog();

  useEffect(() => {
    if (tables && tables.length > 0) {
      posthog.capture('tables_list_viewed', {
        restaurant_id: restaurantId,
        count: tables.length
      });
    }
  }, [tables]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={theme.typography.h4}>Tables</Text>
          <Text style={[theme.typography.caption, { marginBottom: 20 }]}>
            {tables.length} {tables.length === 1 ? 'table' : 'tables'} total
          </Text>
        </View>

        <TouchableOpacity
          style={styles.adminIconButton}
          onPress={() => router.push(`/restaurants/${restaurantId}/restaurant_admin/createTable`)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="admin-panel-settings" size={26} color={theme.colors.primary} />
          <Text style={styles.adminLinkText}>Admin</Text>
        </TouchableOpacity>
      </View>

      {tables.length === 0 ? (
        <Text style={theme.typography.body}>No tables found for this restaurant.</Text>
      ) : (
        tables.map((table) => (
          <TableCard
            key={table.table_id}
            table={table}
            onReserve={() => router.push(`/restaurants/${restaurantId}/reservation?tableId=${table.table_id}`)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  container: { paddingVertical: 20, paddingHorizontal: 4 },
  errorText: { color: 'red', marginBottom: 16 },
  card: {
    ...theme.common.card,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reserveBtn: {
    ...theme.common.button,
    marginTop: 14,
    padding: 12,
  },
  reserveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  reserveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  adminIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  adminLinkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 0,
  },
});
