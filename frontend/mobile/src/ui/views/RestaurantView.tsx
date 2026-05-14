import { useState } from 'react';
import { Text, View} from 'react-native';

import { SearchBar } from '@/ui/components/restaurantView/SearchBar';
import { FilterChip } from '@/ui/components/restaurantView/FilterChip';
import { RestaurantList } from '@/ui/components/restaurantView/RestaurantList';
import { RestaurantFiltersModal } from '@/ui/components/restaurantView/RestaurantFiltersModal';
import { restaurantFilterConfig } from '@/utils/restaurantFilters';
import { useRestaurantSearch } from '@/services/hooks/restaurants/useRestaurantSearch';

export default function RestaurantScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    search,
    setSearch,
    filters,
    toggleArrayFilter,
    clearFilter,
    restaurants = [],
    isLoading,
    error,
  } = useRestaurantSearch();

  return (
    <View style={{ flex: 1,}}>
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        onFilterPress={() =>
          setModalVisible(true)
        }
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
        {Object.entries(filters).map(([key, values]) => {
          if (!Array.isArray(values) || values.length === 0) {
            return null;
          }

          const config =
            restaurantFilterConfig[
              key as keyof typeof restaurantFilterConfig
            ];

          const resolveLabel = (value: string) =>
            config.options.find(o => o.value === value)?.label || value;

          const MAX_VISIBLE = 3;

          const resolved = values.map(resolveLabel);
          const visible = resolved.slice(0, MAX_VISIBLE);
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

      <RestaurantFiltersModal
        visible={modalVisible}
        onClose={() =>
          setModalVisible(false)
        }
        filters={filters}
        toggleArrayFilter={
          toggleArrayFilter
        }
      />

      <RestaurantList
        restaurants={restaurants}
      />

      {isLoading && (
        <Text>Loading restaurants...</Text>
      )}

      {error && (
        <Text>
          Error loading restaurants
        </Text>
      )}
    </View>
  );
}