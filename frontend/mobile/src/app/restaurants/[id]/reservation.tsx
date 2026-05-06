import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useLocalSearchParams } from 'expo-router';
import { useGetTablesByRestaurantId } from '../../../hooks/useRestaurants';
import { getReservationsByTableId } from '../../../api/ReservationAPI';
import { IReservation} from '../../../context/interfaces';

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

    // states
    const [selectedDate, setSelectedDate] = useState(today);
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
                    <TouchableOpacity style={styles.selectorTab}>
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.selectorText}>{new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.text} />
                    </TouchableOpacity>



                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.selectorTab}>
                        <Ionicons name="people-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.selectorText}>{guests} Pers.</Text>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.selectorTab}>
                        <Ionicons name="time-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.selectorText}>Time</Text>
                    </TouchableOpacity>
                </View>

                {/* Date */}
                <View style={[theme.common.card, { padding: 10 }]}>
                    <Calendar
                        current={selectedDate}
                        minDate={today}
                        onDayPress={day => setSelectedDate(day.dateString)}
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
                                    onPress={() => !isDisabled && setSelectedDate(date.dateString)}
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
                            arrowColor: theme.colors.primary,
                            'stylesheet.calendar.header': {
                                week: {
                                    marginTop: 10,
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                }
                            }
                        }}
                    />
                </View>

                {/* Hour */}
                <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                    <Text style={styles.sectionTitle}>Select Time</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                    >
                        {timeSlots.map(time => {
                            const isAvailable = checkIsAnyTableFree(time);
                            const isSelected = selectedTime === time;
                            return (
                                <TouchableOpacity
                                    key={time}
                                    disabled={!isAvailable}
                                    onPress={() => setSelectedTime(time)}
                                    style={[
                                        styles.timeSlot,
                                        isSelected && styles.selectedTimeSlot,
                                        !isAvailable && styles.disabledTimeSlot
                                    ]}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        isSelected && { color: '#fff' },
                                        !isAvailable && { color: '#ccc' }
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 34, 23, 0.08)',
        borderBottomWidth: 3,
        borderBottomColor: 'rgba(34, 34, 23, 0.12)',
        marginBottom: 24,
        marginHorizontal: 2,
        overflow: 'hidden',
    },
    selectorTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    selectorText: {
        fontSize: 12,
        fontWeight: '700',
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
    }

});

export default ReservationScreen;