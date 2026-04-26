import { useState, useEffect } from 'react';

import { getRestaurants, getRestaurantById, getMenuByRestaurantId, getTablesByRestaurantId, postTable } from '../api/RestaurantAPI';
import { IRestaurant, IMenuItem, ITable, ICreateTable } from '@/context/interfaces';

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
        //console.error('useGetRestaurantMenu - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId]);

  return { menu, loading, error };
}

export function useGetTablesByRestaurantId(restaurantId: number) {
  const [tables, setTables] = useState<ITable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTablesByRestaurantId(restaurantId)
        .then(data => {
          setTables(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('useGetTablesByRestaurantId - error:', err);
          setError(err.message);
          setLoading(false);
        });
  }, [restaurantId]);

  return { tables, loading, error };
}

export function usePostTable() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleCreateTable = async (restaurantId: number, tableData: ICreateTable) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postTable(restaurantId, tableData);
      setLoading(false);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail?.[0]?.msg || err.message;
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return { handleCreateTable, loading, error };
}