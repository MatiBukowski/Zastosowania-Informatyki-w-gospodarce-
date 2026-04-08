import { useState, useEffect } from 'react';
import { getRestaurants, getRestaurantById } from '../api/RestaurantAPI';
import { IRestaurant } from '../context/interfaces';

const listCache: IRestaurant[] = [];
let listCached = false;

export const useRestaurants = () => {
    const [restaurants, setRestaurants] = useState<IRestaurant[]>(listCached ? listCache : []);
    const [loading, setLoading] = useState(!listCached);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (listCached) return;
        getRestaurants()
            .then((data) => {
                listCache.push(...data);
                listCached = true;
                setRestaurants(data);
            })
            .catch(() => setError('Failed to load restaurants.'))
            .finally(() => setLoading(false));
    }, []);

    return { restaurants, loading, error };
};

const detailsCache = new Map<number, IRestaurant>();

export const useRestaurantDetails = (id: number) => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(
        detailsCache.get(id) ?? null
    );
    const [loading, setLoading] = useState(!detailsCache.has(id));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (detailsCache.has(id)) return;
        getRestaurantById(id)
            .then((data) => {
                detailsCache.set(id, data);
                setRestaurant(data);
            })
            .catch(() => setError('Failed to load restaurant details.'))
            .finally(() => setLoading(false));
    }, [id]);

    return { restaurant, loading, error };
};