import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IRestaurant } from '../context/interfaces';
import { theme } from '../theme/theme';

interface Props {
    restaurant: IRestaurant;
}

export const RestaurantCard = ({ restaurant }: Props) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/restaurants/${restaurant.restaurant_id}`)}
        >
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.address}>{restaurant.address}</Text>
            <View style={styles.tags}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{restaurant.cuisine}</Text>
                </View>
                {restaurant.has_kiosk && (
                    <View style={[styles.tag, styles.tagGreen]}>
                        <Text style={styles.tagText}>Kiosk</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface ?? '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    name: {
        ...theme.typography.h4,
        marginBottom: 4,
    },
    address: {
        ...theme.typography.body,
        color: theme.colors.text,
        marginBottom: 8,
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tagGreen: {
        backgroundColor: '#2e7d32',
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
    },
});