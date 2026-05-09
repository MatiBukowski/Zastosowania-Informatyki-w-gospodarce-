import React, { useState } from 'react';
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

    const { tables } = useGetTablesByRestaurantId(Number(id));
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

    //filter logic
    const availableTables = tables.filter(table => table.capacity >= Number(guests));
    const handleConfirm = async () => {
        if (!selectedTableId) return alert("Please select a table!");

        try {
            const reservationData = {
                restaurant_id: Number(id),
                table_id: selectedTableId,
                reservation_time: `${date}T${time}:00`,
                user_id: Number(userId),
            };

            const endpointUrl = `/api/tables/${selectedTableId}/reservation`;

            console.log("Endpoint URL:", endpointUrl);
            console.log("Data:", reservationData);


            await apiClient.post(endpointUrl, reservationData);

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
                {availableTables.map(table => (
                    <TouchableOpacity
                        key={table.table_id}
                        style={[
                            styles.tableCard,
                            selectedTableId === table.table_id && styles.selectedCard
                        ]}
                        onPress={() => setSelectedTableId(table.table_id)}
                    >
                        <Ionicons name="square-outline" size={30} color={theme.colors.primary} />
                        <Text>Table {table.table_number}</Text>
                        <Text style={{fontSize: 10}}>Seats: {table.capacity}</Text>
                    </TouchableOpacity>
                ))}
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