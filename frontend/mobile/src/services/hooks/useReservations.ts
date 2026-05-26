import { useState, useEffect, useCallback } from 'react';
import { fetchAll } from '@/services/api/PaginationHelper';
import { getReservationsByTableId, createReservation, getReservationById, updateReservation, getMyReservations } from '@/services/api/ReservationAPI';
import { IReservation, ICreateReservation, IUpdateReservation } from '@/services/interfaces/interfaces';
import { useAuth } from '@/services/providers/AuthProvider';
export function useGetReservationsByTableId(tableId: number) {
    const [reservations, setReservations] = useState<IReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = useCallback(async () => {
            if (!tableId) return;
            setLoading(true);
            try {
                const data = await fetchAll((page, size) => getReservationsByTableId(tableId, page, size));
                setReservations(data);
                setError(null);
            } catch (err: any) {
                console.error('useGetReservationsByTableId - error:', err);
                setError(err.message || 'Failed to fetch table reservations');
            } finally {
                setLoading(false);
            }
    }, [tableId]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    return { reservations, loading, error, refresh: fetchReservations };
}

export function useCreateReservation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (tableId: number, data: ICreateReservation): Promise<IReservation | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await createReservation(tableId, data);
            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('useCreateReservation - error:', err);
            setError(err.message || 'Failed to create reservation');
            setLoading(false);
            return null;
        }
    };

    return { create, loading, error };
}

export function useGetReservationById(reservationId: number) {
    const [reservation, setReservation] = useState<IReservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchById = useCallback(async () => {
        if (!reservationId) return;
        setLoading(true);

        try {
            const data = await getReservationById(reservationId);
            setReservation(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('useGetReservationById - error:', err);
            setError(err.message || 'Failed to fetch reservation');
        } finally {
            setLoading(false);
        }
    }, [reservationId]);

    useEffect(() => {
        fetchById();
    }, [fetchById]);

    return { reservation, loading, error, refresh: fetchById };
}

export function useUpdateReservation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (reservationId: number, data: IUpdateReservation): Promise<IReservation | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await updateReservation(reservationId, data);
            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('useUpdateReservation - error:', err);
            setError(err.message || 'Failed to update reservation');
            setLoading(false);
            return null;
        }
    };

    return { update, loading, error };
}

export function useGetMyReservations() {
    const [reservations, setReservations] = useState<IReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { accessToken } = useAuth();

    const fetchMyReservations = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getMyReservations(accessToken);
            console.log("Reservations from z API:", data);

            const normalizedData = data.map(res => ({
                ...res,
                reservation_time: res.reservation_time.endsWith('Z')
                    ? res.reservation_time
                    : `${res.reservation_time}Z`
            }));

            setReservations(normalizedData);
            setError(null);
        } catch (err: any) {
            console.error('useGetMyReservations - error:', err);
            setError(err.message || 'Failed to fetch user reservations');
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchMyReservations();
    }, [fetchMyReservations]);

    return { reservations, loading, error, refresh: fetchMyReservations };
}