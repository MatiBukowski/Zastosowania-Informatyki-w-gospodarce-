import { apiClient } from './API';

export interface IForecastData {
  historical: [string, number][];
  forecast: [number[]];
  quantile_forecast: [[number[]]];
}

const CACHE_KEY_PREFIX = 'forecast_cache_';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const getForecast = async (restaurantId: number): Promise<IForecastData> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${restaurantId}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const response = await apiClient.get<IForecastData>(`/api/forecast/${restaurantId}`);
  
  localStorage.setItem(cacheKey, JSON.stringify({
    data: response.data,
    timestamp: Date.now()
  }));

  return response.data;
};
