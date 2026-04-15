import { useState, useEffect } from 'react';
import { getRestaurants, getRestaurantById, getMenuByRestaurantId } from '../api/RestaurantAPI';
import { IRestaurant, IMenuItem } from '@/context/interfaces';

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

export function useGetRestaurantById(restaurantId: number) {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurantById(restaurantId)
      .then(data => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('useGetRestaurantById - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId]);

  return { restaurant, loading, error };
}

export function useGetRestaurantMenu(restaurantId: number) {
  const [menu, setMenu] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    getMenuByRestaurantId(restaurantId)
      .then(data => {

        setMenu(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('useGetRestaurantMenu - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId]);

  return { menu, loading, error };
}