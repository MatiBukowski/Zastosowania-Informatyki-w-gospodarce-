import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetTablesByRestaurantId } from '../../../hooks/useRestaurants';
import { getReservationsByTableId } from '../../../api/ReservationAPI';
import { IReservation} from '../../../context/interfaces';
import { useAuth } from '../../../services/AuthProvider';
import { apiClient } from '../../../api/API';


// assuming that the reservation duration is 2h (?)
const reservation_duration_in_min = 120;
const durationMs = reservation_duration_in_min * 60 * 1000;


// currently without range for possible reservation timeslots (open and closing hours)
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

const isSlotAvailable = (slotTime: string, selectedDate: string, allReservations: any[]) => {
    const startTimestamp = new Date(`${selectedDate}T${slotTime}:00`).getTime();


    const endTimestamp = startTimestamp + durationMs;

    // collision check
    return !allReservations.some(res => {
        const existingStart = new Date(`${res.reservation_date}T${res.start_time}:00`).getTime();
        const existingEnd = existingStart + durationMs;
        return startTimestamp < existingEnd && endTimestamp > existingStart;
    });
};

const ReservationScreen = () => {

    const { id, name } = useLocalSearchParams();
    const today = new Date().toISOString().split('T')[0];

    const { userId, accessToken } = useAuth();
    const router = useRouter();

    // states
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [guests, setGuests] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [allRelevantReservations, setAllRelevantReservations] = useState<IReservation[]>([]);

    const [activeSection, setActiveSection] = useState<'calendar' | 'guests' | 'time'>('calendar');
    const { tables, loading: loadingTables } = useGetTablesByRestaurantId(Number(id));

    // check all reservations
    useEffect(() => {
        if (tables && tables.length > 0 && selectedDate) {
            const fetchAll = async () => {
                const suitableTables = tables.filter(t => t.capacity >= guests);
                const promises = suitableTables.map(t => getReservationsByTableId(t.table_id));
                const results = await Promise.all(promises);

                setAllRelevantReservations(results.flat());
            };
            fetchAll();
            }
        }, [tables, guests, selectedDate]);

    const checkIsAnyTableFree = (slotTime: string) => {
        const startTimestamp = new Date(`${selectedDate}T${slotTime}:00`).getTime();
        const endTimestamp = startTimestamp + durationMs;


        const suitableTables = tables.filter(t => t.capacity >= guests);

        // time slot is free if there is a table without collision during that time
        return suitableTables.some(table => {
            // reservations assigned to this table
            const tableReservations = allRelevantReservations.filter(res => res.table_id === table.table_id);

            const hasCollision = tableReservations.some(res => {
                const existingStart = new Date(`${res.reservation_date}T${res.start_time}:00`).getTime();
                const existingEnd = existingStart + durationMs;
                return startTimestamp < existingEnd && endTimestamp > existingStart;
            });

            return !hasCollision;
        });
    };

    const timeSlots = generateTimeSlots(0, 23);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Select Date";
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };


    const handleReservationSubmit = async () => {

    if (!selectedDate || !selectedTime || !guests) {
        alert("Please select date, guests and time first.");
        return;
    }

    // if no token, go to login
    if (!accessToken || !userId) {
        // save path
        router.push('/authorization/login');
        return;
    }

        // find a table
        const suitableTables = tables.filter(t => t.capacity >= guests);
        const freeTable = suitableTables.find(table => {
            const tableReservations = allRelevantReservations.filter(res => res.table_id === table.table_id);
            const startTimestamp = new Date(`${selectedDate}T${selectedTime}:00`).getTime();
            const endTimestamp = startTimestamp + durationMs;

            const hasCollision = tableReservations.some(res => {
                const existingStart = new Date(`${res.reservation_date}T${res.start_time}:00`).getTime();
                const existingEnd = existingStart + durationMs;
                return startTimestamp < existingEnd && endTimestamp > existingStart;
            });
            return !hasCollision;
        });

        if (!freeTable) {
            alert("Sorry, no table available for this specific time.");
            return;
        }

        try {
            const reservationData = {
                restaurant_id: Number(id),
                table_id: freeTable.table_id,
                reservation_time: `${selectedDate}T${selectedTime}:00`,
                user_id: Number(userId),
                status: "CONFIRMED"
            };

            await apiClient.post('/api/reservations', reservationData);
            alert("Success! Your table is booked.");
            router.replace('/'); //
        } catch (error) {
            console.error("Reservation error:", error);
            alert("Something went wrong with the reservation.");
        }
    };


return (
        <SafeAreaView style={theme.common.screenContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.headerContainer}>
                    <Text style={styles.restaurantName}>
                        {name || "Restaurant"}
                    </Text>
                    <Text style={styles.subtitle}>
                        Choose the reservation details
                    </Text>
                </View>

                <View style={styles.segmentedSelector}>
                    <TouchableOpacity
                        style={[styles.selectorTab, activeSection === 'calendar' && styles.activeTab]}
                        onPress={() => setActiveSection('calendar')}
                    >
                        <Ionicons name="calendar-outline" size={18} color={activeSection === 'calendar' ? theme.colors.primary : theme.colors.text} />
                    <Text style={[styles.selectorText, activeSection === 'calendar' && { color: theme.colors.primary }]}>
                        {selectedDate
                            ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : "DATE"
                        }
                    </Text>
                    </TouchableOpacity>


                    <View style={styles.divider} />


                    {/*People*/}

                    <TouchableOpacity
                        disabled={!selectedDate}
                        style={[
                            styles.selectorTab,
                            activeSection === 'guests' && styles.activeTab,
                            !selectedDate && { opacity: 0.3 }
                        ]}
                        onPress={() => setActiveSection('guests')}
                    >
                        <Ionicons name="people-outline" size={18} color={activeSection === 'guests' ? theme.colors.primary : theme.colors.text} />
                        <Text style={[styles.selectorText, activeSection === 'guests' && { color: theme.colors.primary }]}>{guests ? `${guests} Pers.` : "Pers."}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/*Time*/}
                    <TouchableOpacity
                        disabled={!selectedDate || !guests}
                        style={[
                            styles.selectorTab,
                            activeSection === 'time' && styles.activeTab,
                            (!selectedDate || !guests) && { opacity: 0.3 }
                        ]}
                        onPress={() => setActiveSection('time')}
                    >
                        <Ionicons name="time-outline" size={18} color={activeSection === 'time' ? theme.colors.primary : theme.colors.text} />
                        <Text style={[styles.selectorText, activeSection === 'time' && { color: theme.colors.primary }]}>{selectedTime || "Time"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar */}
                {activeSection === 'calendar' && (
                <View style={[theme.common.card, { padding: 10 }]}>
                    <Calendar
                        current={selectedDate || today}
                        minDate={today}

                        onDayPress={day => {
                            setSelectedDate(day.dateString);
                            setActiveSection('guests');
                        }}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: theme.colors.primary }
                        }}
                        renderArrow={(direction) => (
                            <Ionicons
                                name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        )}
                        dayComponent={({ date, state }) => {
                            const isSelected = selectedDate === date?.dateString;
                            const isDisabled = state === 'disabled';
                            const isToday = date?.dateString === today;

                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (!isDisabled && date) {
                                            !isDisabled && setSelectedDate(date.dateString);
                                            setActiveSection('guests');
                                        }
                                    }}
                                    style={[
                                        styles.dayTile,
                                        {
                                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.white,
                                            borderColor: isSelected ? theme.colors.primary : 'rgba(34, 34, 23, 0.1)',
                                            borderBottomWidth: isSelected ? 1 : 3,
                                            opacity: isDisabled ? 0.3 : 1,
                                        }
                                    ]}
                                >
                                    <Text style={{
                                        color: isSelected ? theme.colors.white : (isToday ? theme.colors.primary : theme.colors.text),
                                        fontWeight: isSelected ? '800' : '500',
                                        fontSize: 15
                                    }}>
                                        {date?.day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                        theme={{
                            calendarBackground: 'transparent',
                            textSectionTitleColor: theme.colors.gray,
                            monthTextColor: theme.colors.text,
                            textMonthFontWeight: '800',
                            textMonthFontSize: 18,
                            arrowColor: theme.colors.primary
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
                                    onPress={() => setActiveSection('time') || setGuests(num)}
                                >
                                    <Text style={[styles.gridItemText, guests === num && { color: theme.colors.primary }]}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}


                {/*TIME GRID */}
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

                {selectedDate && guests && selectedTime && (
                    <View style={{ padding: 16, marginBottom: 30 }}>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleReservationSubmit}
                        >
                            <Text style={styles.confirmButtonText}>
                                {!accessToken ? "Login to Reserve" : "Confirm Reservation"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
        // shade
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: theme.colors.text,
    },
    timeSlot: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 34, 23, 0.1)',
        backgroundColor: '#fff',
    },
    selectedTimeSlot: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    disabledTimeSlot: {
        backgroundColor: '#f5f5f5',
        borderColor: '#eee',
        opacity: 0.5,
    },
    timeText: {
        fontWeight: '600',
    },
    activeTab: {
        borderBottomColor: theme.colors.primary,
    },

    gridContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        width: '100%',
    },
    gridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
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
    },
    gridItemText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '700',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }

});

export default ReservationScreen;