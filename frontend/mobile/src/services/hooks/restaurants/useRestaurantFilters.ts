import { useState } from 'react';

import { IRestaurantFilters } from '@/services/interfaces/restaurants';

export function useRestaurantFilters() {
  const [filters, setFilters] = useState<IRestaurantFilters>({
    cuisine: null,
  });

  function toggleArrayFilter<
    K extends keyof IRestaurantFilters
  >(key: K, value: string) {
    setFilters(prev => {
      const current = (prev[key] as string[]) || [];

      const exists = current.includes(value);

      return {
        ...prev,
        [key]: exists ? (
          current.filter(v => v !== value).length > 0
            ? current.filter(v => v !== value)
            : null
        ) : [...current, value],
      };
    });
  }

  function clearFilter<K extends keyof IRestaurantFilters>(
    key: K
  ) {
    setFilters(prev => ({
      ...prev,
      [key]: null,
    }));
  }

  function clearAllFilters() {
    setFilters({
      cuisine: null,
    });
  }

  return {
    filters,
    toggleArrayFilter,
    clearFilter,
    clearAllFilters,
  };
}