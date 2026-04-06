import { useState, useEffect } from 'react';
import { getRestaurants, getRestaurantById } from '../api/API';
import { IRestaurant } from '../context/interfaces';

const restaurantsCache: IRestaurant[] | null = null;
let cachePopulated = false;

export const useRestaurants = () => {
    const [restaurants, setRestaurants] = useState<IRestaurant[]>(
        cachePopulated ? (restaurantsCache ?? []) : []
    );
    const [loading, setLoading] = useState(!cachePopulated);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cachePopulated) return;
        getRestaurants()
            .then((data) => {
                (restaurantsCache as unknown as IRestaurant[]) && Object.assign(restaurantsCache ?? [], data);
                setRestaurants(data);
                cachePopulated = true;
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