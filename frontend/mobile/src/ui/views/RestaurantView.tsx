import { useGetRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from '@/components/RestaurantCard';
import { View, Text, FlatList } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { theme } from '@/ui/theme/theme';


function RestaurantView() {
  const { restaurants, loading, error } = useGetRestaurants();
  const posthog = usePostHog();
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      posthog.capture('restaurants_list_viewed', {
        count: restaurants.length
      });
    }
  }, [restaurants]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={restaurants}
        ListHeaderComponent={
          <View style={{ paddingTop: 8, paddingBottom: 12 }}>
            <Text style={[theme.typography.h4, { color: theme.colors.primary }]}>Restaurants</Text>
            <Text style={[theme.typography.caption, { marginTop: 6 }]}>
              Pick a place to view details and reserve a table.
            </Text>
          </View>
        }
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollBegin={() => setIsScrolling(true)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
        renderItem={({ item }) => 
        <RestaurantCard restaurant={item} pressEnabled={!isScrolling} />
        }
        keyExtractor={(item) => 
          item.restaurant_id.toString()
        }
      />
      {loading && <Text>Loading restaurants...</Text>}
      {error && <Text>Error loading restaurants: {error}</Text>}
    </View>
  );
}

export default RestaurantView;