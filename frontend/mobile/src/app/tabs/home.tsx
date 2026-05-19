import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import ScanQrButton from '@/ui/components/buttons/ScanQrButton';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { useAuth } from '@/services/providers/AuthProvider';
import { useRestaurantSearch } from '@/services/hooks/restaurants/useRestaurantSearch';
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

export default function HomeScreen() {
    const { firstName } = useAuth();
    const { restaurants = [] } = useRestaurantSearch();

    const restaurantCount = restaurants.length;
    const cuisineCount = new Set(restaurants.map(r => r.cuisine)).size;
    const kioskCount = restaurants.filter(r => r.has_kiosk).length;

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