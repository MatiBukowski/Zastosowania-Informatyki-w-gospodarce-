import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenLayout } from '@/ui/layouts/ScreenLayout';
import { useAuth } from '@/services/providers/AuthProvider';
import { theme } from '@/ui/theme/theme';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>{icon}</View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsPage() {
    const { firstName, surname, userId } = useAuth();

    const fullName = firstName && surname ? `${firstName} ${surname}` : 'Unknown user';
    const initials = firstName && surname
        ? `${firstName[0]}${surname[0]}`.toUpperCase()
        : '?';

    return (
        <ScreenLayout>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.pageTitle}>Settings</Text>

                {/* Avatar + name */}
                <View style={[theme.common.card, styles.profileCard]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.profileName}>{fullName}</Text>
                        <Text style={styles.profileSub}>Logged in</Text>
                    </View>
                </View>

                {/* Account info */}
                <SectionHeader title="Account" />
                <View style={theme.common.card}>
                    <InfoRow
                        icon={<Ionicons name="person-outline" size={18} color={theme.colors.primary} />}
                        label="Full name"
                        value={fullName}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        icon={<Ionicons name="id-card-outline" size={18} color={theme.colors.primary} />}
                        label="User ID"
                        value={userId ?? '—'}
                    />
                </View>

                {/* App info */}
                <SectionHeader title="About" />
                <View style={theme.common.card}>
                    <InfoRow
                        icon={<MaterialCommunityIcons name="silverware-fork-knife" size={18} color={theme.colors.primary} />}
                        label="App"
                        value="Restaurant App"
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        icon={<Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />}
                        label="Version"
                        value="1.0.0"
                    />
                </View>

                {/* Hint */}
                <View style={[theme.common.card, styles.hintCard]}>
                    <Ionicons name="lock-closed-outline" size={16} color={theme.colors.gray} style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={styles.hintText}>
                        Logout functionality is coming soon. Seriously. No, really. It's gonna be there. We pinky promise. For the time being, try restoring your mobile device to factory settings instead.
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
    pageTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 16,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.text,
    },
    profileSub: {
        fontSize: 13,
        color: theme.colors.gray,
        marginTop: 2,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 12,
        paddingHorizontal: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    infoIcon: {
        width: 32,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.gray,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.text,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.06)',
        marginVertical: 8,
    },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderColor: 'rgba(0,0,0,0.06)',
        paddingVertical: 12,
        marginTop: 8,
    },
    hintText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.gray,
        lineHeight: 18,
    },
});