import { useLocalSearchParams } from 'expo-router';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import QrLandingView from '@/ui/views/restaurants/QrLandingView';
import { ITable, TableStatus } from '@/services/interfaces/interfaces';

export default function QrLandingScreen() {
    const { id, tableId, tableNumber, capacity, token } = useLocalSearchParams<{
        id: string;
        tableId: string;
        tableNumber: string;
        capacity: string;
        token: string
    }>();

    const table: ITable = {
        table_id: Number(tableId),
        restaurant_id: Number(id),
        table_number: Number(tableNumber),
        capacity: Number(capacity),
        qr_code_token: token ?? '',
        status: TableStatus.FREE,
    };

    return (
        <ScreenLayout>
            <QrLandingView table={table} restaurantId={Number(id)} />
        </ScreenLayout>
    );
}