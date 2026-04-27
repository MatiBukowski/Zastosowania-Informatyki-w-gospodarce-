import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../../theme/theme';
import { usePostTable } from '../../../../hooks/useRestaurants';
import { usePostHog } from 'posthog-react-native';

export default function AddTableScreen() {
    const posthog = usePostHog();

    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const restaurantId = Number(id);

    const { handleCreateTable, loading } = usePostTable();

    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('');

    // only digits 0-9
    const handleIntegerInput = (text: string, setter: (val: string) => void) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setter(cleaned);
    };

    const onCreate = async () => {
        const num = parseInt(tableNumber);
        const cap = parseInt(capacity);

        if (!tableNumber.trim()) {
            Alert.alert("Error", "Please enter a table number (integer).");
            return;
        }

        if (isNaN(cap) || cap < 1) {
            Alert.alert("Error", "Capacity must be at least 1.");
            return;
        }

        try {
            const result = await handleCreateTable(restaurantId, {
                table_number: num,
                capacity: cap
            });

            if (result) {

                posthog.capture('table_created_successfully', {
                    restaurant_id: restaurantId,
                    table_number: num,
                    capacity: cap
                });
                Alert.alert(
                    "Success",
                    `Table #${result.table_number} has been added successfully!`,
                    [{ text: "OK", onPress: () => router.back() }]
                );
            }
        } catch (error: any) {

            posthog.capture('table_creation_failed', {
                restaurant_id: restaurantId,
                error_code: error.response?.status,
                error_message: error.response?.data?.detail || error.message
            });

            let displayError = "Could not create table.";
            if (error.response?.status === 400 || error.response?.status === 409) {
                displayError = error.response?.data?.detail || "This table number already exists.";
            } else if (error.message === "Network Error") {
                displayError = "Server is unreachable. Check your connection.";
            }

            Alert.alert("Creation Failed", displayError);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={theme.typography.h5}>Create Table</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Table Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor={theme.colors.gray}
                        keyboardType="number-pad"
                        value={tableNumber}
                        onChangeText={(text) => handleIntegerInput(text, setTableNumber)}
                    />

                    <Text style={styles.label}>Capacity</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor={theme.colors.gray}
                        keyboardType="number-pad"
                        value={capacity}
                        onChangeText={(text) => handleIntegerInput(text, setCapacity)}
                    />

                    {/* create and cancel buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                theme.common.button,
                                styles.submitBtn,
                                loading && styles.btnDisabled
                            ]}
                            onPress={onCreate}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={styles.btnText}>Create</Text>
                            )}
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.helperText}>
                        Restaurant ID: {restaurantId}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
    },
    header: {
        marginTop: 40,
        marginBottom: 30,
    },
    form: {
        flex: 1,
    },
    label: {
        ...theme.typography.caption,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(34, 34, 23, 0.08)',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 10,
    },
    submitBtn: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 12,
    },
    btnText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelBtn: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        color: theme.colors.gray,
        fontWeight: '600',
        fontSize: 16,
    },
    btnDisabled: {
        backgroundColor: theme.colors.gray,
        opacity: 0.7,
    },
    helperText: {
        ...theme.typography.caption,
        textAlign: 'center',
        marginTop: 30,
        opacity: 0.5,
    }
});