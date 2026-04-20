import { useState, useEffect } from 'react';
import { getReservationsByTableId, createReservation, getReservationById, updateReservation } from '../api/ReservationAPI';
import { IReservation, ICreateReservation } from '../context/interfaces';

export function useGetReservationsByTableId(tableId: number) {
    const [reservations, setReservations] = useState<IReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getReservationsByTableId(tableId)
            .then(data => {
                setReservations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('useGetReservationsByTableId - error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [tableId]);

    return { reservations, loading, error };
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
            setError(err.message);
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

    useEffect(() => {
        getReservationById(reservationId)
            .then(data => {
                setReservation(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('useGetReservationById - error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [reservationId]);

    return { reservation, loading, error };
}

export function useUpdateReservation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (reservationId: number, data: Partial<ICreateReservation>): Promise<IReservation | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await updateReservation(reservationId, data);
            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('useUpdateReservation - error:', err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    return { update, loading, error };
}