import React, { useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '@/services/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { theme } from '@/ui/theme/theme';

const LoginScreen = ({ embedded = false }: { embedded?: boolean }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const posthog = usePostHog();

    const handleLogin = async () => {
        try {
            await login({ email, password });
            posthog.capture('login_success', { email });
            console.log("Logged in successfully!");
            if (!embedded){
                router.back();
            }

        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Login error! Please check your details.";
            posthog.capture('login_failed', { email, error: errorMessage });
            alert("Login error! Please check your details.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formCard}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Please login to continue your reservation</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 15 }}
                    onPress={() => router.back()}
                >
                    <Text style={{ color: '#666', textAlign: 'center' }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundColor,
        justifyContent: 'center',
    },
    formCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 5,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default LoginScreen;