import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getRestaurants, getRestaurantById, getMenuByRestaurantId, getTablesByRestaurantId, postTable } from '@/services/api/RestaurantAPI';
import { IRestaurant, IMenuItem, ITable, ICreateTable } from '@/services/interfaces/interfaces';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';
import { fetchNext, fetchAll } from '@/services/api/PaginationHelper';
import { getUserFacingErrorMessage } from '@/services/errorReporting';

export function useGetRestaurants(params: { search: string | null } & IRestaurantFilters) {
  return useInfiniteQuery({
    queryKey: ['restaurants', params],
    queryFn: ({ pageParam }) => fetchNext((p, s) => getRestaurants(params, p, s), pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    select: (data) => ({
      restaurants: data.pages.flatMap((page) => page.items),
      hasMore: !!data.pageParams.at(-1),
    }),
  });
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
        setError(getUserFacingErrorMessage(err, 'Could not load this restaurant.'));
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
        setError(getUserFacingErrorMessage(err, 'Could not load the menu.'));
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
          setError(getUserFacingErrorMessage(err, 'Could not load tables.'));
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
      const errorMessage = getUserFacingErrorMessage(err, 'Could not create table.');
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return { handleCreateTable, loading, error };
}
