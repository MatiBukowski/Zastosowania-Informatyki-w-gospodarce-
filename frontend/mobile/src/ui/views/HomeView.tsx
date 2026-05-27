import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ScanQrButton from '@/ui/components/buttons/ScanQrButton';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { useAuth } from '@/services/providers/AuthProvider';
import { useRestaurantSearch } from '@/services/hooks/restaurants/useRestaurantSearch';
import { IRestaurant } from '@/services/interfaces/interfaces';
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

function FeaturedCard({ restaurant, onPress }: { restaurant: IRestaurant; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.featuredImageBox}>
                {restaurant.photo ? (
                    <Image
                        source={{ uri: restaurant.photo }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                    />
                ) : (
                    <MaterialCommunityIcons name="silverware-fork-knife" size={32} color={theme.colors.primary} />
                )}
            </View>
            <View style={styles.featuredBody}>
                <Text style={styles.featuredName} numberOfLines={1}>{restaurant.name}</Text>
                <View style={styles.featuredMeta}>
                    <MaterialCommunityIcons name="earth" size={12} color={theme.colors.gray} />
                    <Text style={styles.featuredCuisine}>{restaurant.cuisine}</Text>
                </View>
                {restaurant.has_kiosk && (
                    <View style={styles.kioskBadge}>
                        <MaterialCommunityIcons name="tablet" size={10} color={theme.colors.primary} />
                        <Text style={styles.kioskBadgeText}>Kiosk</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function HomeView() {
    const { firstName, accessToken, logout } = useAuth();
    const { restaurants = [] } = useRestaurantSearch();
    const router = useRouter();

    const restaurantCount = restaurants.length;
    const cuisineCount = new Set(restaurants.map(r => r.cuisine)).size;
    const kioskCount = restaurants.filter(r => r.has_kiosk).length;
    const featured = restaurants.slice(0, 5);

    const handleAuthAction = () => {
        if (accessToken) {
            logout();
        } else {
            router.push('/user/login');
        }
    };

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
                    <TouchableOpacity style={styles.logoBox} onPress={handleAuthAction} activeOpacity={0.7}>
                        {accessToken ? (
                            <MaterialCommunityIcons name="logout" size={28} color={theme.colors.primary} />
                        ) : (
                            <MaterialCommunityIcons name="login" size={28} color={theme.colors.primary} />
                        )}
                    </TouchableOpacity>
                    <View style={styles.logoBox}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={theme.colors.primary} />
                    </View>
                </View>

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

                {/* Featured restaurants */}
                {featured.length > 0 && (
                    <View style={styles.featuredSection}>
                        <View style={styles.featuredHeader}>
                            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
                            <TouchableOpacity onPress={() => router.push('/tabs/restaurants')}>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                        >
                            {featured.map(r => (
                                <FeaturedCard
                                    key={r.restaurant_id}
                                    restaurant={r}
                                    onPress={() => router.push(`/restaurants/${r.restaurant_id}`)}
                                />
                            ))}
                        </ScrollView>
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
    featuredSection: {
        marginBottom: 16,
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    featuredList: {
        gap: 12,
        paddingRight: 4,
    },
    featuredCard: {
        width: 150,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.07)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    featuredImageBox: {
        height: 90,
        backgroundColor: 'rgba(229,75,75,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredBody: {
        padding: 10,
        gap: 4,
    },
    featuredName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    featuredMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    featuredCuisine: {
        fontSize: 11,
        color: theme.colors.gray,
        textTransform: 'capitalize',
    },
    kioskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(229,75,75,0.1)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    kioskBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
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