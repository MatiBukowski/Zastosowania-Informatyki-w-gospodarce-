import { useState, useEffect, useCallback } from 'react';

import { getRestaurants, getRestaurantById, getMenuByRestaurantId, getTablesByRestaurantId, postTable } from '../api/RestaurantAPI';
import { fetchAll, fetchNext } from '../api/PaginationHelper';
import { IRestaurant, IMenuItem, ITable, ICreateTable } from '@/context/interfaces';

export function useGetRestaurants() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRestaurants = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetchNext((p, s) => getRestaurants(p, s), pageNum, 10);
      setRestaurants(prev => pageNum === 1 ? response.items : [...prev, ...response.items]);
      setHasMore(response.page < response.pages);
      setPage(response.page);
      setLoading(false);
    } catch (err: any) {
      console.error('useGetRestaurants - error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants(1);
  }, [loadRestaurants]);

  const fetchMore = () => {
    if (!loading && hasMore) {
      loadRestaurants(page + 1);
    }
  };

  return { restaurants, loading, error, fetchMore, hasMore };
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

    fetchAll((page, size) => getMenuByRestaurantId(restaurantId, page, size))
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
    fetchAll((page, size) => getTablesByRestaurantId(restaurantId, page, size))
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