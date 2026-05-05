import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useLocalSearchParams } from 'expo-router';

const ReservationScreen = () => {
    const { id, name } = useLocalSearchParams();
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [guests, setGuests] = useState(2);

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

                {/* Calendar */}
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
    }
});

export default ReservationScreen;