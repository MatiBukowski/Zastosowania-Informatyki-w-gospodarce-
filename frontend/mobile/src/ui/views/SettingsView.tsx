import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

import { useAuth } from "@/services/providers/AuthProvider";
import { theme } from "@/ui/theme/theme";
import LoginModal from "@/ui/components/authModals/LoginModal";
import RegisterModal from "@/ui/components/authModals/RegisterModal";

export default function SettingsView() {
  const { accessToken, userId, firstName, surname, logout } = useAuth();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const isSignedIn = Boolean(accessToken);
  const displayName = [firstName, surname].filter(Boolean).join(" ") || "Guest";
  const initials = [firstName, surname]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const handleLogin = () => {
    setIsLoginVisible(true);
  };

  const handleRegister = () => {
    setIsRegisterVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "You will need to sign in again to access your account features.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            void logout();
          },
        },
      ]
    );
  };

  return (
    <>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* <View style={styles.header}>
        <Text style={styles.kicker}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your profile, sign in, and keep the app ready for reservations.
        </Text>
      </View> */}

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileMeta}>
              {isSignedIn ? `User ID: ${userId ?? "unknown"}` : "Not signed in"}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isSignedIn ? styles.statusSignedIn : styles.statusSignedOut,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isSignedIn ? styles.statusTextSignedIn : styles.statusTextSignedOut,
              ]}
            >
              {isSignedIn ? "Signed in" : "Guest"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {isSignedIn ? "Session" : "Get started"}
        </Text>
        <Text style={styles.sectionCopy}>
          {isSignedIn
            ? "Keep your session active or sign out when you are done."
            : "Sign in to manage reservations and access your account details."}
        </Text>

        {isSignedIn ? (
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Log out</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.authActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
              <Text style={styles.actionButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>More</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App version</Text>
          <Text style={styles.infoValue}>Preview build</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Support</Text>
          <Text style={styles.infoValue}>Contact the team</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Privacy</Text>
          <Text style={styles.infoValue}>Reservation data only</Text>
        </View>
      </View>
    </ScrollView>

    <LoginModal visible={isLoginVisible} onClose={() => setIsLoginVisible(false)} />
    <RegisterModal visible={isRegisterVisible} onClose={() => setIsRegisterVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    paddingTop: 8,
    gap: 6,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: theme.colors.secondary,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.gray,
    maxWidth: 340,
  },
  card: {
    ...theme.common.card,
    marginBottom: 0,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  profileMeta: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusSignedIn: {
    backgroundColor: "rgba(54, 125, 61, 0.12)",
  },
  statusSignedOut: {
    backgroundColor: "rgba(136, 136, 136, 0.12)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextSignedIn: {
    color: theme.colors.secondary,
  },
  statusTextSignedOut: {
    color: theme.colors.gray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 6,
  },
  sectionCopy: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.gray,
    marginBottom: 14,
  },
  authActions: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 2,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34, 34, 23, 0.12)",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(34, 34, 23, 0.08)",
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.gray,
  },
});