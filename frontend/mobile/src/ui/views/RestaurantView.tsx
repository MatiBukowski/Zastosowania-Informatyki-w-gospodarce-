import { useGetRestaurants } from '@/services/hooks/useRestaurants';
import RestaurantCard from '@/ui/components/RestaurantCard';
import { View, Text, FlatList, TextInput, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { theme } from '@/ui/theme/theme';
import { Ionicons } from '@expo/vector-icons';

import { CuisineType } from '@/services/interfaces/interfaces';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';

// Cuisine options from CuisineType enum
const CUISINE_OPTIONS = Object.entries(CuisineType).map(([key, value]) => ({ label: value.charAt(0) + value.slice(1).toLowerCase(), value }));


function RestaurantView() {
  const [filters, setFilters] = useState<IRestaurantFilters>({ cuisine: null });
  const [search, setSearch] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data: restaurants, isLoading, error } = useGetRestaurants({ search: debouncedSearch, ...filters });
  const posthog = usePostHog();
  const [isScrolling, setIsScrolling] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      posthog.capture('restaurants_list_viewed', {
        count: restaurants.length
      });
    }
  }, [restaurants]);

  const removeFilter = (key: keyof IRestaurantFilters) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const hasAnyFilter = !!filters.cuisine;

  return (
    <View style={{ flex: 1 }}>
      <SearchBar search={search} setSearch={setSearch} onFilterPress={() => setFilterModalVisible(true)} />

      {hasAnyFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ minHeight: 40, marginBottom: 2 }}>
          {filters.cuisine ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondary, borderRadius: 16, paddingHorizontal: 12, marginRight: 8, height: 32 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 4 }}>Cuisine: {CUISINE_OPTIONS.find(opt => opt.value === filters.cuisine)?.label || filters.cuisine}</Text>
              <Pressable onPress={() => removeFilter('cuisine')} hitSlop={8}>
                <Ionicons name="close" size={18} color="white" />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Filters</Text>
            <Text style={{ marginTop: 8, marginBottom: 4 }}>Cuisine</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {CUISINE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={{
                    backgroundColor: filters.cuisine === opt.value ? theme.colors.secondary : '#eee',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => setFilters(f => ({ ...f, cuisine: f.cuisine === opt.value ? null : opt.value }))}
                >
                  <Text style={{ color: filters.cuisine === opt.value ? 'white' : '#333' }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ padding: 8 }}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
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

function SearchBar({
  search,
  setSearch,
  onFilterPress,
}: {
  search: string | null;
  setSearch: (value: string | null) => void;
  onFilterPress: () => void;
}) {
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
        value={search ?? ''}
        onChangeText={text => setSearch(text === '' ? null : text)}
        clearButtonMode="while-editing"
      />
      <Pressable onPress={onFilterPress} hitSlop={8}>
        <Ionicons name="filter" size={20} color="#888" style={{ marginLeft: 8 }} />
      </Pressable>
    </View>
  );
}

function useDebounce(search: string | null, arg1: number) {
  const [debounced, setDebounced] = useState<string | null>(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), arg1);
    return () => clearTimeout(timer);
  }, [search, arg1]);

  return debounced;
}

export default RestaurantView;