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
        {Object.entries(filters).map(
          ([key, values]) => {
            if (
              !Array.isArray(values) ||
              values.length === 0
            ) {
              return null;
            }

            const config =
              restaurantFilterConfig[
                key as keyof typeof restaurantFilterConfig
              ];

            return values.map(value => {
              const label =
                config.options.find(
                  option =>
                    option.value === value
                )?.label || value;

              return (
                <FilterChip
                  key={`${key}-${value}`}
                  label={label}
                  onRemove={() =>
                    toggleArrayFilter(
                      key as any,
                      value
                    )
                  }
                />
              );
            });
          }
        )}
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