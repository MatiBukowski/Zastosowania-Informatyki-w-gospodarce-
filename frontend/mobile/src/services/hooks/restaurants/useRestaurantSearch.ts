import { useState } from 'react';

import { useGetRestaurants } from '@/services/hooks/useRestaurants';
import { useDebounce } from '@/services/hooks/generic/useDebounce';
import { useRestaurantFilters } from '@/services/hooks/restaurants/useRestaurantFilters';
import { serializeFilters } from '@/utils/restaurantFilters';

export function useRestaurantSearch() {
  const [search, setSearch] = useState('');

  const {
    filters,
    toggleArrayFilter,
    clearFilter,
    clearAllFilters,
  } = useRestaurantFilters();

  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 300);

  const serializedFilters = serializeFilters(
    debouncedFilters
  );

  const {
    data: restaurants,
    isLoading,
    error,
  } = useGetRestaurants({
    search: debouncedSearch || null,
    ...serializedFilters,
  });

  return {
    search,
    setSearch,

    filters,
    toggleArrayFilter,
    clearFilter,
    clearAllFilters,

    restaurants,
    isLoading,
    error,
  };
}