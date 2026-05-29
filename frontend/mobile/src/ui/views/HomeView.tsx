import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ScanQrButton from '@/ui/components/buttons/ScanQrButton';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { useAuth } from '@/services/providers/AuthProvider';
import { useRestaurantSearch } from '@/services/hooks/restaurants/useRestaurantSearch';
import { useGetMyReservations } from '@/services/hooks/useReservations';
import { IReservation, ReservationStatus } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <View style={styles.statCard}>
            {icon}
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function statusColor(status: ReservationStatus): string {
    switch (status) {
        case ReservationStatus.CONFIRMED: return '#2e7d32';
        case ReservationStatus.PENDING:   return '#e65100';
        case ReservationStatus.COMPLETED: return '#555';
        case ReservationStatus.CANCELED:  return '#c62828';
        default: return '#888';
    }
}

function ReservationCard({ reservation, onPress }: { reservation: IReservation; onPress: () => void }) {
    const date = new Date(reservation.reservation_time);
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return (
        <TouchableOpacity style={styles.reservationCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.reservationDateBox}>
                <Text style={styles.reservationDay}>{date.getDate()}</Text>
                <Text style={styles.reservationMonth}>
                    {date.toLocaleString('en-GB', { month: 'short' }).toUpperCase()}
                </Text>
            </View>
            <View style={styles.reservationBody}>
                <Text style={styles.reservationTitle} numberOfLines={1}>
                    Reservation #{reservation.reservation_id}
                </Text>
                <Text style={styles.reservationSub}>{dateStr} at {timeStr}</Text>
                <Text style={styles.reservationSub}>Table #{reservation.table_id}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusColor(reservation.status) }]} />
        </TouchableOpacity>
    );
}

export default function HomeView() {
    const { firstName } = useAuth();
    const { restaurants = [] } = useRestaurantSearch();
    const { reservations, loading: reservationsLoading } = useGetMyReservations();
    const router = useRouter();

    const restaurantCount = restaurants.length;
    const cuisineCount = new Set(restaurants.map(r => r.cuisine)).size;
    const kioskCount = restaurants.filter(r => r.has_kiosk).length;

    const upcomingReservations = reservations
        .filter(r =>
            new Date(r.reservation_time) >= new Date() &&
            r.status !== ReservationStatus.CANCELED &&
            r.status !== ReservationStatus.COMPLETED
        )
        .slice(0, 3);

    return (
        <ScreenLayout>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            {firstName ? `Hello, ${firstName}!` : 'Welcome!'}
                        </Text>
                        <Text style={styles.subtitle}>What would you like to do today?</Text>
                    </View>
                    <View style={styles.logoBox}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={theme.colors.primary} />
                    </View>
                </View>

                {/* QR scan card */}
                <View style={[theme.common.card, styles.scanCard]}>
                    <MaterialCommunityIcons name="qrcode-scan" size={36} color={theme.colors.primary} style={{ marginBottom: 10 }} />
                    <Text style={styles.scanTitle}>Scan a table QR code</Text>
                    <Text style={styles.scanDesc}>
                        Scan the QR code at your table to access the menu and order food directly from your phone.
                    </Text>
                    <View style={{ marginTop: 16 }}>
                        <ScanQrButton />
                    </View>
                </View>

                {/* My Reservations */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Reservations</Text>
                    <TouchableOpacity /* onPress={() => router.push('') */>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>

                {reservationsLoading ? (
                    <View style={styles.reservationsLoading}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                ) : upcomingReservations.length === 0 ? (
                    <View style={[theme.common.card, styles.emptyReservations]}>
                        <Ionicons name="calendar-outline" size={28} color={theme.colors.gray} style={{ opacity: 0.4 }} />
                        <Text style={styles.emptyText}>No upcoming reservations</Text>
                        <TouchableOpacity onPress={() => router.push('/tabs/restaurants')}>
                            <Text style={styles.emptyAction}>Browse restaurants →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.reservationsList}>
                        {upcomingReservations.map(r => (
                            <ReservationCard
                                key={r.reservation_id}
                                reservation={r}
                                onPress={() => router.push(`/reservations/${r.reservation_id}`)}
                            />
                        ))}
                    </View>
                )}

                {/* Stats */}
                {restaurantCount > 0 && (
                    <View style={[theme.common.card, styles.statsCard]}>
                        <StatCard
                            icon={<MaterialCommunityIcons name="silverware-fork-knife" size={22} color={theme.colors.primary} />}
                            value={String(restaurantCount)}
                            label="Available Restaurants"
                        />
                        <View style={styles.statDivider} />
                        <StatCard
                            icon={<MaterialCommunityIcons name="earth" size={22} color={theme.colors.primary} />}
                            value={String(cuisineCount)}
                            label="Cuisines"
                        />
                        <View style={styles.statDivider} />
                        <StatCard
                            icon={<MaterialCommunityIcons name="tablet" size={22} color={theme.colors.primary} />}
                            value={String(kioskCount)}
                            label="Restaurants With Kiosk"
                        />
                    </View>
                )}

                {/* Onboarding hint */}
                <View style={[theme.common.card, styles.hintCard]}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} style={{ marginRight: 8 }} />
                    <Text style={styles.hintText}>
                        Browse restaurants or scan the QR code at your seat to get started.
                    </Text>
                </View>

            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 12,
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 2,
    },
    logoBox: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.07)',
    },
    scanCard: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    scanTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    scanDesc: {
        fontSize: 14,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    reservationsLoading: {
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyReservations: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.gray,
        fontWeight: '500',
    },
    emptyAction: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    reservationsList: {
        gap: 10,
        marginBottom: 16,
    },
    reservationCard: {
        ...theme.common.card,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        marginBottom: 0,
    },
    reservationDateBox: {
        width: 44,
        height: 48,
        borderRadius: 10,
        backgroundColor: 'rgba(229,75,75,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reservationDay: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.primary,
        lineHeight: 20,
    },
    reservationMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    reservationBody: {
        flex: 1,
        gap: 2,
    },
    reservationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    reservationSub: {
        fontSize: 12,
        color: theme.colors.gray,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.gray,
        fontWeight: '600',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,169,135,0.12)',
        borderColor: 'rgba(255,169,135,0.3)',
        paddingVertical: 12,
    },
    hintText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 18,
    },
});