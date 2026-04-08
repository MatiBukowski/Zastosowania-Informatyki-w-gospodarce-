import { FlatList, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRestaurants } from '../hooks/useRestaurants';
import { RestaurantCard } from '../components/RestaurantCard';
import { theme } from '../theme/theme';

export default function HomePageMobile() {
    const { restaurants, loading, error } = useRestaurants();

    return (
        <SafeAreaView style={theme.common.screenContainer}>
            {loading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}

            {error && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'red' }}>{error}</Text>
                </View>
            )}

            {!loading && !error && (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => String(item.restaurant_id)}
                    renderItem={({ item }) => <RestaurantCard restaurant={item} />}
                    contentContainerStyle={{ padding: 16 }}
                    ListHeaderComponent={
                        <Text style={[theme.typography.h4, { marginBottom: 16 }]}>
                            Restaurants 🍴
                        </Text>
                    }
                    ListEmptyComponent={
                        <Text style={theme.typography.body}>No restaurants found.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}