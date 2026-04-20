import { useGetRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from '@/components/RestaurantCard';
import { View, Text, FlatList } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';


function RestaurantView() {
  const { restaurants, loading, error } = useGetRestaurants();
  const posthog = usePostHog();

  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      posthog.capture('restaurants_list_viewed', {
        count: restaurants.length
      });
    }
  }, [restaurants]);

  return (
    <View>
      <FlatList
        data={restaurants}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        keyExtractor={(item) => item.restaurant_id.toString()}
      />
      {loading && <Text>Loading restaurants...</Text>}
      {error && <Text>Error loading restaurants: {error}</Text>}
    </View>
  );
}

export default RestaurantView;