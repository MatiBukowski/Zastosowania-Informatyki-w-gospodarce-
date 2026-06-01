import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetTablesByRestaurantId } from '@/services/hooks/useRestaurants';
import { useAuth } from '@/services/providers/AuthProvider';
import { theme } from '@/ui/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { getReservationsByTableId, createReservation } from '@/services/api/ReservationAPI';
import { fetchAll } from '@/services/api/PaginationHelper';
import { usePostHog } from 'posthog-react-native';
import { getUserFacingErrorMessage } from '@/services/errorReporting';
 import StyledButton from "@/ui/components/buttons/StyledButton";
import ConfirmModal from '../../components/modals/ConfirmModal';

const RestaurantSelectTableView = () => {
    const { id, date, time, guests, name } = useLocalSearchParams();
    const { userId } = useAuth();
    const router = useRouter();
    const [allReservations, setAllReservations] = useState<any[]>([]);
    const { tables } = useGetTablesByRestaurantId(Number(id));
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showOrderPrompt, setShowOrderPrompt] = useState(false);
    const [createdReservation, setCreatedReservation] = useState<any | null>(null);
    const durationMs = 120 * 60 * 1000; // should be somewhere
    const posthog = usePostHog();

    useEffect(() => {
        const fetchRes = async () => {
            try {
                setIsLoading(true);

                const promises = tables.map(t =>
                    fetchAll((page, size) => getReservationsByTableId(t.table_id, page, size))
                        .then(data => {

                            console.log(`Table ${t.table_id} API returned:`, data.length, "items");
                            return data;
                        })
                        .catch(err => {
                            console.warn(`Error for table ${t.table_id}:`, err);
                            return [];
                        })
                );

                const results = await Promise.all(promises);
                const flatResults = results.flat();

                setAllReservations(flatResults);
            } catch (err) {
                console.error("Error fetching reservations:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (tables && tables.length > 0) fetchRes();
    }, [tables]);

    //tables filter logic
    const availableTables = tables.filter(table => {
        const hasEnoughCapacity = table.capacity >= Number(guests);


        if (!hasEnoughCapacity) return false;

        const selectedStart = new Date(`${date}T${time}:00`).getTime();
        //const durationMs = 120 * 60 * 1000; // 2h
        const selectedEnd = selectedStart + durationMs;


        const tableReservations = allReservations.filter(res =>
            Number(res.table_id) === Number(table.table_id)
        );

        console.log(`- Reservations found in DB for this table: ${tableReservations.length}`);

        const hasCollision = tableReservations.some(res => {
            const resStart = new Date(res.reservation_time).getTime();
            const resEnd = resStart + durationMs;

            // collision condition
            const isColliding = selectedStart < resEnd && selectedEnd > resStart;
            return isColliding;
        });


        return !hasCollision;
    });

    const handleConfirm = async () => {
        if (!selectedTableId) return alert("Please select a table!");

        try {
            const localDateTime = `${date}T${time}:00`;
            const reservationData = {
                restaurant_id: Number(id),
                table_id: selectedTableId,
                reservation_time: localDateTime,
                user_id: Number(userId),
            };




            const response = await createReservation(selectedTableId, reservationData as any);
            posthog.capture('restaurant_reservation_created', {
                restaurant_id: id,
                restaurant_name: name,
                table_id: selectedTableId,
                reservation_time: localDateTime,
                guest_count: guests
            });

            setCreatedReservation(response);
            setShowOrderPrompt(true);
        } catch (error: any) {
            const errorMessage = getUserFacingErrorMessage(error, "Could not create reservation.");
            posthog.capture('restaurant_reservation_failed', {
                restaurant_id: id,
                restaurant_name: name,
                table_id: selectedTableId,
                error: errorMessage,
                guest_count: guests
            });
            console.error("Reservation error details:", error.response?.data || error.message);
            alert(errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.paddedSection}>
                <Text style={styles.title}>Select Table at {name}</Text>
                <Text style={styles.subtitle}>{date} at {time}</Text>
            </View>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: 'gray' }}>Checking table availability...</Text>
                </View>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.tableGrid}>
                        {availableTables.map(table => {
                            const isSelected = selectedTableId === table.table_id;
                            return (
                                <TouchableOpacity
                                    key={table.table_id}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.tableCard,
                                        isSelected ? styles.selectedCard : styles.defaultCard
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

                <View style={styles.footerContainer}>
                    <StyledButton
                        onPress={handleConfirm}
                        disabled={!selectedTableId}
                        accessibilityLabel="Confirm My Selection"
                    >
                        Confirm My Selection
                    </StyledButton>
                </View>
                <ConfirmModal
                    visible={showOrderPrompt}
                    title="Reservation successful!"
                    message="Would you like to order food when you get to the restaurant?"
                    secondaryLabel="Not now"
                    primaryLabel="Order now"
                    onSecondary={() => {
                        setShowOrderPrompt(false);
                        router.replace('/');
                    }}
                    onPrimary={() => {
                        setShowOrderPrompt(false);
                        router.replace(`/restaurants/${id}/menu?tableId=${selectedTableId}&reservationId=${createdReservation?.reservation_id}`);
                    }}
                />
            </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //padding: 20,
        //backgroundColor: theme.colors.backgroundColor,
    },
    paddedSection: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 20,
    },
    subtitle: {
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    tableCard: {
        width: '48%',
        height: 100,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    defaultCard: {
        borderColor: 'rgba(0,0,0,0.08)',
    },
    selectedCard: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        backgroundColor: '#fdf2f2',
        elevation: 6,
    },
    tableNumber: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    capacityText: {
        fontSize: 12,
        color: 'gray',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    footerContainer: {
        padding: 16,
        marginBottom: 30,
        //backgroundColor: '#fff',
    },
});
export default RestaurantSelectTableView;
