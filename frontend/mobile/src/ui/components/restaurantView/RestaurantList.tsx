import { FlatList } from 'react-native';

import RestaurantCard from '@/ui/components/restaurantView/RestaurantCard';
import { IRestaurant } from '@/services/interfaces/interfaces';

export function RestaurantList({
  restaurants,
}: {
  restaurants: IRestaurant[];
}) {
  return (
    <FlatList
      data={restaurants}
      showsVerticalScrollIndicator={false}
      keyExtractor={item =>
        item.restaurant_id.toString()
      }
      renderItem={({ item }) => (
        <RestaurantCard restaurant={item} />
      )}
    />
  );
}