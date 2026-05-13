import { useGetRestaurants } from '@/services/hooks/useRestaurants';
import RestaurantCard from '@/ui/components/RestaurantCard';
import { View, Text, FlatList, TextInput } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { theme } from '@/ui/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';


function RestaurantView() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: restaurants, isLoading, error } = useGetRestaurants({ search: debouncedSearch });
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
      <View style={{ paddingTop: 8, paddingBottom: 12 }}>
        <Text style={[theme.typography.h4, { color: theme.colors.primary }]}>Restaurants</Text>
        <Text style={[theme.typography.caption, { marginTop: 6 }]}>
          Pick a place to view details and reserve a table.
        </Text>
      </View>
      <SearchBar search={search} setSearch={setSearch} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={restaurants}
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
      {isLoading && <Text>Loading restaurants...</Text>}
      {error && <Text>Error loading restaurants: {error.message}</Text>}
    </View>
  );
}

function SearchBar({ search, setSearch }: { search: string; setSearch: (value: string) => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          color: '#000',
        }}
        placeholder="Search restaurants..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

function useDebounce(search: string, arg1: number) {
  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), arg1);
    return () => clearTimeout(timer);
  }, [search, arg1]);

  return debounced;
}

export default RestaurantView;