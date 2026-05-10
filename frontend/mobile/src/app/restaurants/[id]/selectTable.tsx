 import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetTablesByRestaurantId } from '../../../hooks/useRestaurants';
import { useAuth } from '../../../services/AuthProvider';
import { apiClient } from '../../../api/API';
import { theme } from '../../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const SelectTableScreen = () => {
    const { id, date, time, guests, name } = useLocalSearchParams();
    const { userId } = useAuth();
    const router = useRouter();
    const [allReservations, setAllReservations] = useState<any[]>([]);
    const { tables } = useGetTablesByRestaurantId(Number(id));
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRes = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching reservations for tables:", tables.map(t => t.table_id));

                const promises = tables.map(t =>
                    apiClient.get(`/api/tables/${t.table_id}/reservation`)
                        .then(res => {
                            console.log(`Table ${t.table_id} API returned:`, res.data.length, "items");
                            return res.data;
                        })
                        .catch(err => [])
                );

                const results = await Promise.all(promises);
                const flatResults = results.flat();
                console.log("Total reservations in state:", flatResults.length);
                setAllReservations(flatResults);
            } catch (err) {
                console.error("Error getting reservation:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (tables && tables.length > 0) fetchRes();
    }, [tables]);

    //filter logic
    //const availableTables = tables.filter(table => table.capacity >= Number(guests));
const availableTables = tables.filter(table => {
    // 1. Sprawdzenie pojemności
    const hasEnoughCapacity = table.capacity >= Number(guests);

    console.log(`\n[CHECKING TABLE] ID: ${table.table_id} (No. ${table.table_number})`);
    console.log(`- Capacity: ${table.capacity} vs Required: ${guests} -> ${hasEnoughCapacity ? 'PASS ✅' : 'FAIL ❌'}`);

    if (!hasEnoughCapacity) return false;

    // 2. Przygotowanie czasu wybranego przez użytkownika (UTC)
    const selectedStart = new Date(`${date}T${time}:00Z`).getTime();
    const durationMs = 120 * 60 * 1000; // 2h
    const selectedEnd = selectedStart + durationMs;

    console.log(`- User wants slot: ${date} ${time} (UTC)`);
    console.log(`  Start TS: ${selectedStart} | End TS: ${selectedEnd}`);

    // 3. Sprawdzanie kolizji z istniejącymi rezerwacjami
    const tableReservations = allReservations.filter(res =>
        Number(res.table_id) === Number(table.table_id)
    );

    console.log(`- Reservations found in DB for this table: ${tableReservations.length}`);

    const hasCollision = tableReservations.some(res => {
        const resStart = new Date(res.reservation_time).getTime();
        const resEnd = resStart + durationMs;

        // Warunek kolizji
        const isColliding = selectedStart < resEnd && selectedEnd > resStart;

        if (isColliding) {
            console.log(`  ! COLLISION DETECTED !`);
            console.log(`    DB Res: ${res.reservation_time}`);
            console.log(`    DB Start TS: ${resStart} | DB End TS: ${resEnd}`);
        }

        return isColliding;
    });

    console.log(`- Final Decision: ${hasCollision ? 'HIDDEN (Busy) ❌' : 'SHOWING (Free) ✅'}`);

    return !hasCollision;
});

    const handleConfirm = async () => {
        if (!selectedTableId) return alert("Please select a table!");

        try {
            const localDateTime = new Date(`${date}T${time}:00`);
            const reservationData = {
                restaurant_id: Number(id),
                table_id: selectedTableId,
                reservation_time: localDateTime.toISOString(),
                user_id: Number(userId),
            };

            const endpointUrl = `/api/tables/${selectedTableId}/reservation`;

            console.log("API URL:", endpointUrl);
            console.log("Data:", reservationData);


            const response = await apiClient.post(endpointUrl, reservationData);
            console.log("Server status:", response.status);
            console.log("Data:", response.data);
            alert("Reservation successful!");
            router.dismissAll();
            router.replace('/');
        } catch (error: any) {
            console.error("Reservation error details:", error.response?.data || error.message);
            alert("Error creating reservation. Check console for details.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Table at {name}</Text>
            <Text style={styles.subtitle}>{date} at {time}</Text>

            <ScrollView contentContainerStyle={styles.tableGrid}>
                {availableTables.map(table => {
                    const isSelected = selectedTableId === table.table_id;
                    return (
                        <TouchableOpacity
                            key={table.table_id}
                            activeOpacity={0.7}
                            style={[
                                styles.tableCard,
                                isSelected && styles.selectedCard
                            ]}
                            onPress={() => setSelectedTableId(table.table_id)}
                        >
                            <Ionicons
                                name={isSelected ? "checkbox" : "square-outline"}
                                size={30}
                                color={isSelected ? theme.colors.primary : "#ccc"}
                            />
                            <Text style={[styles.tableNumber, isSelected && { color: theme.colors.primary }]}>
                                Table {table.table_number}
                            </Text>
                            <Text style={styles.capacityText}>Seats: {table.capacity}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Confirm My Selection</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 20 },
    subtitle: { textAlign: 'center', color: 'gray', marginBottom: 20 },
    tableGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    tableCard: {
        width: '48%',
        height: 100,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15
    },
    selectedCard: { borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: '#fdf2f2' },
    confirmButton: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default SelectTableScreen;