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
  const [filters, setFilters] = useState<{ cuisine: string[] }>({ cuisine: [] });
  const [search, setSearch] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const debouncedCuisine = useDebounce(filters.cuisine, 300);
  // Send cuisine as comma-separated string for API
  const { data: restaurants, isLoading, error } = useGetRestaurants({ search: debouncedSearch, cuisine: debouncedCuisine.length ? debouncedCuisine.join(',') : undefined });
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

  // Remove a single cuisine from the array
  const removeCuisine = (cuisine: string) => {
    setFilters(f => ({ ...f, cuisine: f.cuisine.filter(c => c !== cuisine) }));
  };

  const hasAnyFilter = filters.cuisine.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <SearchBar search={search} setSearch={setSearch} onFilterPress={() => setFilterModalVisible(true)} />

      {hasAnyFilter && (
        <View style={{ minHeight: 40, marginBottom: 12, maxWidth: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.secondary,
              borderRadius: 16,
              paddingLeft: 12,
              paddingRight: 4,
              alignSelf: 'flex-start',
              flexWrap: 'wrap',
              maxWidth: '100%',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                marginRight: 4,
                flexShrink: 1,
                flexWrap: 'wrap',
                maxWidth: '90%',
              }}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              Cuisine: {filters.cuisine.map(c => CUISINE_OPTIONS.find(opt => opt.value === c)?.label || c).join(', ')}
            </Text>
            <Pressable onPress={() => setFilters(f => ({ ...f, cuisine: [] }))} hitSlop={8} style={{ justifyContent: 'center', alignItems: 'center', height: 32, marginRight: 2 }}>
              <Ionicons name="close" size={18} color="white" />
            </Pressable>
          </View>
        </View>
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
              {CUISINE_OPTIONS.map(opt => {
                const selected = filters.cuisine.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={{
                      backgroundColor: selected ? theme.colors.secondary : '#eee',
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => setFilters(f => {
                      const exists = f.cuisine.includes(opt.value);
                      return {
                        ...f,
                        cuisine: exists
                          ? f.cuisine.filter(c => c !== opt.value)
                          : [...f.cuisine, opt.value]
                      };
                    })}
                  >
                    <Text style={{ color: selected ? 'white' : '#333' }}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
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

function useDebounce(search: string | string[] | null, arg1: number) {
  const [debounced, setDebounced] = useState<string | string[] | null>(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), arg1);
    return () => clearTimeout(timer);
  }, [search, arg1]);

  return debounced;
}

export default RestaurantView;