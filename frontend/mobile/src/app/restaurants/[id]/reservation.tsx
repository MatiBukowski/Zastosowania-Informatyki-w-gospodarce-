import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetTablesByRestaurantId } from '../../../hooks/useRestaurants';
import { getTablesByRestaurantId } from '../../../api/RestaurantApi';
import { getReservationsByTableId } from '../../../api/ReservationAPI';
import { IReservation } from '../../../context/interfaces';
import { useAuth } from '../../../services/AuthProvider';
import { Dimensions } from 'react-native';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SECTION_HEIGHT = SCREEN_HEIGHT * 0.4;

const reservation_duration_in_min = 120;
const durationMs = reservation_duration_in_min * 60 * 1000;

const generateTimeSlots = (startHour: number, endHour: number) => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let min = 0; min < 60; min += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = min.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
};

const ReservationScreen = () => {
    const { id, name } = useLocalSearchParams();
    const today = new Date().toISOString().split('T')[0];
    const { userId, accessToken } = useAuth();
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [guests, setGuests] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [allRelevantReservations, setAllRelevantReservations] = useState<IReservation[]>([]);
    const [activeSection, setActiveSection] = useState<'calendar' | 'guests' | 'time'>('calendar');

    const { tables, loading: loadingTables } = useGetTablesByRestaurantId(Number(id));

    // fetch all reservations for tables that fit the guest count
    useEffect(() => {
        const fetchAllData = async () => {
            if (!id || !selectedDate || !guests || !tables || tables.length === 0) return;

            try {
                const suitableTables = tables.filter((t: any) => t.capacity >= Number(guests));

                const promises = suitableTables.map((t: any) =>
                    getReservationsByTableId(t.table_id)
                        .then(data => data)
                        .catch(() => [])
                );

                const results = await Promise.all(promises);
                const flatResults = results.flat();

                console.log(`[DEBUG] Loaded ${flatResults.length} reservations for ${suitableTables.length} tables`);
                setAllRelevantReservations(flatResults);
            } catch (err) {
                console.error("Error fetching reservation data:", err);
            }
        };

        fetchAllData();
    }, [id, selectedDate, guests, tables]);

    // time slot availability check
    const checkIsAnyTableFree = (slotTime: string) => {
        if (!selectedDate || !guests || tables.length === 0) return false;


        const slotStart = new Date(`${selectedDate}T${slotTime}:00Z`).getTime();
        const slotEnd = slotStart + durationMs;

        const suitableTables = tables.filter(t => t.capacity >= Number(guests));

        // if there is at least one table without collision
        return suitableTables.some(table => {
            const tableRes = allRelevantReservations.filter(res =>
                Number(res.table_id) === Number(table.table_id)
            );

            if (tableRes.length === 0) return true;

            const hasCollision = tableRes.some(res => {
                if (!res.reservation_time) return false;


                const resStart = new Date(res.reservation_time).getTime();
                const resEnd = resStart + durationMs;

                // 2h slot
                const colliding = slotStart < resEnd && slotEnd > resStart;

                return colliding;
            });

            return !hasCollision;
        });
    };

    const timeSlots = generateTimeSlots(0, 23);
    const isComplete = selectedDate && guests && selectedTime;
    const handleReservationSubmit = () => {
        if (!selectedDate || !selectedTime || !guests) {
            Alert.alert("Missing Information", "Please select date, guests and time first.");
            return;
        }

        if (!accessToken || !userId) {
            router.push('/user/login');
            return;
        }

        router.push({
            pathname: "/restaurants/[id]/selectTable",
            params: {
                id: id,
                date: selectedDate,
                time: selectedTime,
                guests: guests,
                name: name
            }
        });
    };

    return (
        <SafeAreaView style={theme.common.screenContainer}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}>

                <View style={styles.headerContainer}>
                    <Text style={styles.restaurantName}>{name || "Restaurant"}</Text>
                    <Text style={styles.subtitle}>Choose the reservation details</Text>
                </View>

                {/* Segmented Selector */}
                <View style={styles.segmentedSelector}>
                    <TouchableOpacity
                        style={[styles.selectorTab, activeSection === 'calendar' && styles.activeTab]}
                        onPress={() => setActiveSection('calendar')}
                    >
                        <Ionicons name="calendar-outline" size={18} color={activeSection === 'calendar' ? theme.colors.primary : theme.colors.text} />
                        <Text style={[styles.selectorText, activeSection === 'calendar' && { color: theme.colors.primary }]}>
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "DATE"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        disabled={!selectedDate}
                        style={[styles.selectorTab, activeSection === 'guests' && styles.activeTab, !selectedDate && { opacity: 0.3 }]}
                        onPress={() => setActiveSection('guests')}
                    >
                        <Ionicons name="people-outline" size={18} color={activeSection === 'guests' ? theme.colors.primary : theme.colors.text} />
                        <Text style={[styles.selectorText, activeSection === 'guests' && { color: theme.colors.primary }]}>
                            {guests ? `${guests} Pers.` : "Pers."}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        disabled={!selectedDate || !guests}
                        style={[styles.selectorTab, activeSection === 'time' && styles.activeTab, (!selectedDate || !guests) && { opacity: 0.3 }]}
                        onPress={() => setActiveSection('time')}
                    >
                        <Ionicons name="time-outline" size={18} color={activeSection === 'time' ? theme.colors.primary : theme.colors.text} />
                        <Text style={[styles.selectorText, activeSection === 'time' && { color: theme.colors.primary }]}>
                            {selectedTime || "Time"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar, Guests, Time */}
                {activeSection === 'calendar' && (
                    <View style={[theme.common.card, { padding: 10 }]}>
                        <Calendar
                            current={selectedDate || today}
                            minDate={today}
                            onDayPress={day => {
                                setSelectedDate(day.dateString);
                                setActiveSection('guests');
                            }}
                            markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }}
                            renderArrow={(direction) => (
                                <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={24} color={theme.colors.primary} />
                            )}
                            dayComponent={({ date, state }) => {
                                const isSelected = selectedDate === date?.dateString;
                                const isDisabled = state === 'disabled';
                                const isToday = date?.dateString === today;

                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (!isDisabled && date) {
                                                setSelectedDate(date.dateString);
                                                setActiveSection('guests');
                                            }
                                        }}
                                        style={[styles.dayTile, {
                                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.white,
                                            borderColor: isSelected ? theme.colors.primary : 'rgba(34, 34, 23, 0.1)',
                                            borderBottomWidth: isSelected ? 1 : 3,
                                            opacity: isDisabled ? 0.3 : 1,
                                        }]}
                                    >
                                        <Text style={{ color: isSelected ? theme.colors.white : (isToday ? theme.colors.primary : theme.colors.text), fontWeight: isSelected ? '800' : '500', fontSize: 15 }}>
                                            {date?.day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                )}

                {activeSection === 'guests' && selectedDate && (
                    <View style={styles.gridContainer}>
                        <View style={styles.gridWrapper}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                <TouchableOpacity
                                    key={num}
                                    style={[styles.gridItem, guests === num && styles.selectedItem]}
                                    onPress={() => { setGuests(num); setActiveSection('time'); }}
                                >
                                    <Text style={[styles.gridItemText, guests === num && { color: theme.colors.primary }]}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {activeSection === 'time' && selectedDate && guests && (
                    <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                        <View style={styles.gridWrapper}>
                            {timeSlots.map(time => {
                                const isAvailable = checkIsAnyTableFree(time);
                                const isSelected = selectedTime === time;
                                return (
                                    <TouchableOpacity
                                        key={time}
                                        disabled={!isAvailable}
                                        onPress={() => setSelectedTime(time)}
                                        style={[
                                            styles.gridItem,
                                            isSelected && styles.selectedItem,
                                            !isAvailable && styles.disabledItem
                                        ]}
                                    >
                                        <Text style={[styles.gridItemText, isSelected && { color: theme.colors.primary }, !isAvailable && { color: '#ccc' }]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !isComplete && styles.disabledButton
                    ]}
                    onPress={handleReservationSubmit}
                    disabled={!isComplete}
                >
                    <Text style={[styles.confirmButtonText, !isComplete]}>
                        {isComplete ? "Confirm Reservation" : "Complete Selections"}
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 40,
        marginBottom: 32,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    restaurantName: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '900',
        color: theme.colors.text,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'center',
    },
    segmentedSelector: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginHorizontal: 16,
        padding: 4,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    selectorTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    selectorText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text,
        textTransform: 'uppercase',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(34, 34, 23, 0.08)',
        height: '50%',
        alignSelf: 'center',
    },
    dayTile: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        marginVertical: 2,
    },
    gridContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        width: '100%',
    },
    footerContainer: {
        padding: 16,
        marginBottom: 30,
    },
    gridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
    },
    defaultItem: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    gridItem: {
        width: '23%',
        aspectRatio: 1.5,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        marginRight: '2%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    gridItemText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '700',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    activeTab: {
        borderBottomColor: theme.colors.primary,
    },
    selectedItem: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    disabledItem: {
        backgroundColor: '#f0f0f0',
        borderColor: '#eee',
        opacity: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    timeSectionContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 15,
        marginLeft: 4,
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
        elevation: 0,
        shadowOpacity: 0,
    },
});

export default ReservationScreen;