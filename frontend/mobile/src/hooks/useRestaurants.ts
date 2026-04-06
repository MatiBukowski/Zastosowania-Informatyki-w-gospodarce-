import { useState, useEffect } from 'react';
import { getRestaurants } from '../api/RestaurantAPI';
import { IRestaurant } from '@/context/interfaces';

export function useGetRestaurants() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurants()
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('useGetRestaurants - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { restaurants, loading, error };
}