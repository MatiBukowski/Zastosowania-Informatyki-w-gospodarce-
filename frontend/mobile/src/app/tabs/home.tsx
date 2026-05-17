import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import ScanQrButton from '@/ui/components/buttons/ScanQrButton';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { useAuth } from '@/services/providers/AuthProvider';
import { theme } from '@/ui/theme/theme';

export default function HomeScreen() {
    const { firstName } = useAuth();

    return (
        <ScreenLayout>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            {firstName ? `Hello, ${firstName}!` : 'Welcome!'}
                        </Text>
                        <Text style={styles.subtitle}>What would you like to do today?</Text>
                    </View>
                    <View style={styles.logoBox}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={theme.colors.primary} />
                    </View>
                </View>

                {/* QR scan card */}
                <View style={[theme.common.card, styles.scanCard]}>
                    <MaterialCommunityIcons name="qrcode-scan" size={36} color={theme.colors.primary} style={{ marginBottom: 10 }} />
                    <Text style={styles.scanTitle}>Scan a table QR code</Text>
                    <Text style={styles.scanDesc}>
                        Scan the QR code at your table to access the menu and order food directly from your phone.
                    </Text>
                    <View style={{ marginTop: 16 }}>
                        <ScanQrButton />
                    </View>
                </View>

                {/* Onboarding hint */}
                <View style={[theme.common.card, styles.hintCard]}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} style={{ marginRight: 8 }} />
                    <Text style={styles.hintText}>
                        Browse restaurants or scan the QR code at your seat to get started.
                    </Text>
                </View>

            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 12,
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 2,
    },
    logoBox: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.07)',
    },
    scanCard: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 20,
    },
    scanTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    scanDesc: {
        fontSize: 14,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,169,135,0.12)',
        borderColor: 'rgba(255,169,135,0.3)',
        paddingVertical: 12,
    },
    hintText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 18,
    },
});