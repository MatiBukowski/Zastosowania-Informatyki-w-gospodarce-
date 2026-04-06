import { useGetRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from '@/components/RestaurantCard';
import { View, Text, FlatList } from 'react-native';


function RestaurantView() {
  const { restaurants, loading, error } = useGetRestaurants();

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