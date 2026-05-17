import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { usePostHog } from 'posthog-react-native';

import { SearchBar } from '@/ui/components/restaurantView/SearchBar';
import { FilterChip } from '@/ui/components/restaurantView/FilterChip';
import { RestaurantFiltersModal } from '@/ui/components/restaurantView/RestaurantFiltersModal';
import RestaurantCard from '@/ui/components/restaurantView/RestaurantCard';
import { restaurantFilterConfig } from '@/utils/restaurantFilters';
import { useRestaurantSearch } from '@/services/hooks/restaurants/useRestaurantSearch';
import { theme } from '@/ui/theme/theme';

const MAX_VISIBLE_CHIPS = 3;

export default function RestaurantScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const posthog = usePostHog();

  const {
    search,
    setSearch,
    filters,
    toggleArrayFilter,
    clearFilter,
    restaurants = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useRestaurantSearch();

  useEffect(() => {
    if (restaurants.length > 0) {
      posthog.capture('restaurants_list_viewed', {
        count: restaurants.length,
      });
    }
  }, [restaurants]);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={{ paddingTop: 8, paddingBottom: 12 }}>
        <Text style={[theme.typography.h4, { color: theme.colors.primary }]}>
          Restaurants
        </Text>
        <Text style={[theme.typography.caption, { marginTop: 6 }]}>
          Pick a place to view details and reserve a table.
        </Text>
      </View>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        onFilterPress={() => setModalVisible(true)}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Object.entries(filters).map(([key, values]) => {
          if (!Array.isArray(values) || values.length === 0) return null;

          const config = restaurantFilterConfig[key as keyof typeof restaurantFilterConfig];
          const resolveLabel = (value: string) =>
            config.options.find((o) => o.value === value)?.label ?? value;

          const resolved = values.map(resolveLabel);
          const visible = resolved.slice(0, MAX_VISIBLE_CHIPS);
          const remaining = resolved.length - visible.length;

          const chipLabel =
            remaining > 0
              ? `${config.label}: ${visible.join(', ')} +${remaining}`
              : `${config.label}: ${resolved.join(', ')}`;

          return (
            <FilterChip
              key={key}
              label={chipLabel}
              onRemove={() => clearFilter(key as any)}
            />
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={restaurants}
        keyExtractor={(item) => item.restaurant_id.toString()}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <RestaurantCard restaurant={item} pressEnabled={!isScrolling} />
        )}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollBegin={() => setIsScrolling(true)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
        onEndReached={() => {
          if (hasNextPage && !isLoading) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter()}
      />

      {error && (
        <Text>Error loading restaurants</Text>
      )}

      <RestaurantFiltersModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        filters={filters}
        toggleArrayFilter={toggleArrayFilter}
      />
    </View>
  );
}