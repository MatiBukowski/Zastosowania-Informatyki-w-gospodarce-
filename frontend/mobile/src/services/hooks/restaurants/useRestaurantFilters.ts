import { useState } from 'react';

import { IRestaurantFilters } from '@/services/interfaces/restaurants';

export function useRestaurantFilters() {
  const [filters, setFilters] = useState<IRestaurantFilters>({
    cuisine: [],
  });

  function toggleArrayFilter<
    K extends keyof IRestaurantFilters
  >(key: K, value: string) {
    setFilters(prev => {
      const current = (prev[key] as string[]) || [];

      const exists = current.includes(value);

      return {
        ...prev,
        [key]: exists
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  }

  function clearFilter<K extends keyof IRestaurantFilters>(
    key: K
  ) {
    setFilters(prev => ({
      ...prev,
      [key]: [],
    }));
  }

  function clearAllFilters() {
    setFilters({
      cuisine: [],
    });
  }

  return {
    filters,
    toggleArrayFilter,
    clearFilter,
    clearAllFilters,
  };
}