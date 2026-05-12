import { useState, useEffect } from 'react';
import { createOrder, getOrderById, cancelOrder } from '../api/OrderAPI';
import { IOrder, ICreateOrder } from '../context/interfaces';

export function useGetOrderById(orderId: number) {
    const [order, setOrder] = useState<IOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getOrderById(orderId)
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('useGetOrderById - error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [orderId]);

    return { order, loading, error };
}

export function useCreateOrder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: ICreateOrder): Promise<IOrder | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await createOrder(data);
            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('useCreateOrder - error:', err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    return { create, loading, error };
}

export function useCancelOrder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cancel = async (orderId: number): Promise<IOrder | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await cancelOrder(orderId);
            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('useCancelOrder - error:', err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    return { cancel, loading, error };
}