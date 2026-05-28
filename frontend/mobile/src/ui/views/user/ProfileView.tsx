import React from 'react';
import { useAuth } from '@/services/providers/AuthProvider';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@/ui/theme/theme';
import { IReservation, ReservationStatus } from '@/services/interfaces/interfaces';
import { useGetMyReservations} from '@/services/hooks/useReservations';
import { useGetRestaurantById } from '@/services/hooks/useRestaurants';

import LoginScreen from '@/app/user/login';

export default function ProfileTab() {
  const { accessToken } = useAuth();
  const router = useRouter();

  if (!accessToken) {
    return <LoginScreen embedded={true} />;
  }


    return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Profile</Text>

      {/* MY RESERVATIONS */}
      <TouchableOpacity
        style={[theme.common.card, { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, marginBottom: 16, paddingVertical: 16 }]}
        onPress={() => router.push('/user/UserReservations')}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={28} color="#fff" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>My Reservations</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Check your upcoming tables</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,

  },
  pageTitle: {
    ...theme.typography.h4,
    marginBottom: 20,
    marginLeft: 4,
  },
  text: {
    ...theme.typography.h6,
    color: theme.colors.gray,
  }

});