import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ITable } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';

interface QrLandingViewProps {
    table: ITable;
    restaurantId: number;
}

export default function QrLandingView({ table, restaurantId }: QrLandingViewProps) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.iconBox}>
                <MaterialCommunityIcons name="qrcode-scan" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>You're at Table {table.table_number}!</Text>
            <Text style={styles.subtitle}>
                Seats up to {table.capacity} guests. What would you like to do?
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionCard, styles.actionCardPrimary]}
                    activeOpacity={0.8}
                    onPress={() => router.replace(`/restaurants/${restaurantId}/menu`)}
                >
                    <Ionicons name="restaurant-outline" size={32} color="#fff" />
                    <Text style={styles.actionTitlePrimary}>View Menu</Text>
                    <Text style={styles.actionDescPrimary}>
                        Browse dishes and drinks available at this restaurant.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, styles.actionCardSecondary]}
                    activeOpacity={0.8}
                    onPress={() => router.replace(`/restaurants/${restaurantId}/reservation`)}
                >
                    <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                    <Text style={styles.actionTitleSecondary}>Reserve This Table</Text>
                    <Text style={styles.actionDescSecondary}>
                        Book this table.
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Steps hint */}
            <View style={styles.stepsBox}>
                <Text style={styles.stepsTitle}>How it works</Text>
                <View style={styles.step}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                    <Text style={styles.stepText}>Scan the QR code at your table</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                    <Text style={styles.stepText}>Browse the menu or reserve your spot</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                    <Text style={styles.stepText}>Enjoy your meal!</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => router.replace(`/tabs/home`)} style={styles.backLink}>
                <Ionicons name="arrow-back" size={14} color={theme.colors.gray} />
                <Text style={styles.backLinkText}>Go to home tab</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    iconBox: {
        backgroundColor: 'rgba(229,75,75,0.1)',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    actions: {
        width: '100%',
        gap: 12,
        marginBottom: 28,
    },
    actionCard: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 6,
    },
    actionCardPrimary: {
        backgroundColor: theme.colors.primary,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    actionCardSecondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    actionTitlePrimary: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    actionDescPrimary: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 18,
    },
    actionTitleSecondary: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    actionDescSecondary: {
        fontSize: 13,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 18,
    },
    stepsBox: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 16,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    stepsTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepNum: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(229,75,75,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumText: {
        fontSize: 13,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    stepText: {
        fontSize: 14,
        color: theme.colors.text,
        flex: 1,
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backLinkText: {
        fontSize: 13,
        color: theme.colors.gray,
    },
});