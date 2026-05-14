import { CuisineType } from "@/services/interfaces/interfaces";
import { IRestaurantFilters } from '@/services/interfaces/restaurants';

export const restaurantFilterConfig = {
  cuisine: {
    label: 'Cuisine',
    type: 'multi-select',
    options: Object.values(CuisineType).map(value => ({
      label: value.charAt(0) + value.slice(1).toLowerCase(),
      value,
    })),
  },
} as const;

export function serializeFilters(filters: IRestaurantFilters) {
  return Object.entries(filters).reduce(
    (acc, [key, value]) => {
      if (!value) {
        return acc;
      }

      acc[key] = Array.isArray(value)
        ? value.join(',')
        : String(value);

      return acc;
    },
    {} as Record<string, string>
  );
}