import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetRestaurantById } from '../../hooks/useRestaurants';
import { theme } from '../../theme/theme';

export default function RestaurantDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { restaurant, loading, error } = useGetRestaurantById(Number(id));

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
            <Text style={theme.typography.h4}>{restaurant.name}</Text>
            <Text style={[theme.typography.body, styles.address]}>{restaurant.address}</Text>

            <View style={styles.tags}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{restaurant.cuisine}</Text>
                </View>
                {restaurant.has_kiosk && (
                    <View style={[styles.tag, { backgroundColor: '#2e7d32' }]}>
                        <Text style={styles.tagText}>Kiosk available</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {/* Primary CTAs — routes to be implemented in issues #19 and #20 */}
            <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => router.push(`/restaurants/${restaurant.restaurant_id}/reservation`)}
            >
                <Text style={styles.buttonTextPrimary}>Reserve a table</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => router.push(`/restaurants/${restaurant.restaurant_id}/menu`)}
            >
                <Text style={styles.buttonTextSecondary}>See menu</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    container: { padding: 20 },
    address: { color: theme.colors.text, marginTop: 6, marginBottom: 12 },
    tags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    tag: {
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagText: { color: '#fff', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
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